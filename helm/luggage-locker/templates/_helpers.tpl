{{- define "luggage-locker.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "luggage-locker.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "luggage-locker.frontendFullname" -}}
{{- printf "%s-frontend" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "luggage-locker.convexFullname" -}}
{{- "convex" -}}
{{- end -}}

{{- define "luggage-locker.postgresFullname" -}}
{{- "postgres" -}}
{{- end -}}

{{- define "luggage-locker.secretName" -}}
{{- "secret" -}}
{{- end -}}

{{- define "luggage-locker.frontendConfigName" -}}
{{- "frontend-config" -}}
{{- end -}}

{{- define "luggage-locker.namespace" -}}
{{- if .Values.namespaceOverride -}}
{{- .Values.namespaceOverride -}}
{{- else -}}
{{- .Release.Namespace -}}
{{- end -}}
{{- end -}}

{{- define "luggage-locker.labels" -}}
app.kubernetes.io/name: {{ include "luggage-locker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "luggage-locker.selectorLabels" -}}
app.kubernetes.io/name: {{ include "luggage-locker.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "luggage-locker.componentLabels" -}}
{{ include "luggage-locker.selectorLabels" .root }}
app.kubernetes.io/component: {{ .component }}
{{- end -}}
