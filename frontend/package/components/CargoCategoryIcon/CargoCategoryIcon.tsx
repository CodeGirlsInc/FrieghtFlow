
import {
  Smartphone,
  Thermometer,
  Sofa,
  FileText,
  Wrench,
  Shirt,
  Car,
  Package,
  LucideIcon,
  AlertTriangle,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../components/ui/tooltip';

interface CargoCategoryIconProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const iconMap: Record<string, LucideIcon> = {
  Electronics: Smartphone,
  'Hazardous Materials': AlertTriangle,
  'Perishable Goods': Thermometer,
  Furniture: Sofa,
  Documents: FileText,
  Machinery: Wrench,
  Clothing: Shirt,
  'Automotive Parts': Car,
  Other: Package,
};

export function CargoCategoryIcon({ category, size = 'md' }: CargoCategoryIconProps) {
  const Icon = iconMap[category] || Package;
  const iconSize = sizeMap[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className={iconSize} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{category}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}