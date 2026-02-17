import { motion } from "framer-motion";
import { UtensilsCrossed, Clock, MapPin, Phone } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import heroImage from "@/assets/restaurant-hero.jpg";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Hero / Restaurant info */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img
          src={heroImage}
          alt="La Maison restaurant interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 flex flex-col justify-end p-10 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-display font-bold text-primary-foreground tracking-tight">
                La Maison
              </h1>
            </div>
            <p className="text-primary-foreground/80 text-lg font-body font-light mb-8 max-w-md">
              Fine Indian & Continental cuisine in an elegant setting. Let our assistant help you reserve the perfect table.
            </p>
            <div className="space-y-3 text-primary-foreground/70 text-sm font-body">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Lunch 12–3 PM · Dinner 7–10 PM</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>42 Heritage Lane, New Delhi</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden border-b border-border px-4 py-3 flex items-center gap-3 bg-card">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">La Maison</h1>
            <p className="text-xs text-muted-foreground font-body">Reservation Assistant</p>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex border-b border-border px-6 py-4 items-center gap-3 bg-card/50">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-muted-foreground font-body">Reservation Assistant · Online</span>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default Index;
