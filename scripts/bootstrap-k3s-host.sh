#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root."
  exit 1
fi

LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"

if [ -z "$LETSENCRYPT_EMAIL" ]; then
  echo "Set LETSENCRYPT_EMAIL before running this script."
  exit 1
fi

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get -y upgrade
DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl docker.io git jq

systemctl enable docker --now

if ! command -v helm >/dev/null 2>&1; then
  curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

if ! command -v k3s >/dev/null 2>&1; then
  curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik" sh -
fi

systemctl enable k3s --now

if command -v ufw >/dev/null 2>&1; then
  UFW_STATUS="$(ufw status | head -n 1 || true)"
  if [ "$UFW_STATUS" = "Status: active" ]; then
    ufw allow 80/tcp
    ufw allow 443/tcp
  fi
fi

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx >/dev/null 2>&1 || true
helm repo add jetstack https://charts.jetstack.io >/dev/null 2>&1 || true
helm repo update

helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set crds.enabled=true

kubectl wait --namespace ingress-nginx --for=condition=Available deployment/ingress-nginx-controller --timeout=300s
kubectl wait --namespace cert-manager --for=condition=Available deployment/cert-manager --timeout=300s
kubectl wait --namespace cert-manager --for=condition=Available deployment/cert-manager-webhook --timeout=300s
kubectl wait --namespace cert-manager --for=condition=Available deployment/cert-manager-cainjector --timeout=300s

kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    email: ${LETSENCRYPT_EMAIL}
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-staging-account-key
    solvers:
      - http01:
          ingress:
            ingressClassName: nginx
EOF

kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: ${LETSENCRYPT_EMAIL}
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01:
          ingress:
            ingressClassName: nginx
EOF
