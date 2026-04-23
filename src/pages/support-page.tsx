import { motion } from "framer-motion";
import { QrcodeCanvas } from "react-qrcode-pretty";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Or } from "@/components/or";
import { PageLayout } from "@/components/page-layout";
import { env } from "@/lib/env";
import { useNavigationStore } from "@/store/navigation-store";

export default function SupportPage() {
  const goBack = useNavigationStore((state) => state.goBack);
  const supportChatUrl = env.supportChat.startsWith("http")
    ? env.supportChat
    : `https://${env.supportChat}`;
  const supportChatLabel = env.supportChat.replace(/^https?:\/\//, "");

  return (
    <PageLayout headerButton={<Button onClick={() => goBack()}>Back</Button>}>
      <div className="flex gap-8">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          className="w-full"
        >
          <Card className="aspect-square h-full">
            <div>
              <QrcodeCanvas
                value={supportChatUrl}
                size={512}
                internalProps={{ style: { width: "100%", height: "100%" } }}
                variant={{ eyes: "fluid", body: "fluid" }}
              />
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 30, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          className="w-full"
        >
          <Card className="text-2xl font-black whitespace-pre">
            <div>Scan the QR using your phone</div>
            <Or />
            <div>Call us: {env.supportPhone}</div>
            <Or />
            <div>Text us: {supportChatLabel}</div>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
}
