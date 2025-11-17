import {
  Slack,
  Calendar,
  Database,
  MessageCircle,
  Mail,
  Globe,
} from "lucide-react";
import { Bot } from "lucide-react";

export function Integrations() {
  const integrations = [
    { name: "Salesforce", icon: Database },
    { name: "Zapier", icon: Globe },
    { name: "Google Workspace", icon: Mail },
    { name: "Gmail", icon: Mail },
    { name: "Slack", icon: Slack },
    { name: "WhatsApp", icon: MessageCircle },
    { name: "HubSpot", icon: Database },
    { name: "Calendly", icon: Calendar },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4">
            Se integra con tus{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              herramientas favoritas
            </span>
          </h2>
        </div>

        {/* Mobile: Simple grid */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center hover:border-indigo-300 transition-colors"
              >
                <integration.icon
                  className="w-8 h-8 text-indigo-500 mb-2 mx-auto"
                  strokeWidth={1.5}
                />
                <div className="text-gray-600 text-sm leading-tight">
                  {integration.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}