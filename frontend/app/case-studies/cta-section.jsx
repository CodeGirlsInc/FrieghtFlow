import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Phone } from "lucide-react";

export default function CTASection() {
  return (
    <div className="bg-primary/5 rounded-xl p-8 md:p-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Transform Your Logistics Operations?
        </h2>
        <p className="text-lg text-subText mb-8">
          Join the growing list of companies that have revolutionized their
          supply chain with FreightFlow's innovative solutions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            Request a Demo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg">
            <Phone className="mr-2 h-4 w-4" />
            Talk to Sales
          </Button>
          <Button variant="outline" size="lg">
            <FileText className="mr-2 h-4 w-4" />
            Download Brochure
          </Button>
        </div>
      </div>
    </div>
  );
}
