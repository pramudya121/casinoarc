import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface GameCardProps {
  title: string;
  icon: LucideIcon;
  path: string;
  description: string;
}

export const GameCard = ({ title, icon: Icon, path, description }: GameCardProps) => {
  return (
    <Link to={path}>
      <Card className="card-casino p-6 hover:border-primary transition-all cursor-pointer group h-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
