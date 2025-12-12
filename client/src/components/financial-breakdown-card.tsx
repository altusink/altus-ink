import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, DollarSign, Users, Building } from "lucide-react";

interface FinancialBreakdownCardProps {
  totalAmount: number;
  currency?: string;
  artistAmount?: number;
  platformFee?: number;
  vendorAmount?: number;
  showBreakdown?: boolean;
}

export function FinancialBreakdownCard({
  totalAmount,
  currency = "EUR",
  artistAmount,
  platformFee,
  vendorAmount,
  showBreakdown = true,
}: FinancialBreakdownCardProps) {
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "BRL" ? "R$" : currency;
  
  const calculatedArtist = artistAmount ?? totalAmount * 0.68;
  const calculatedPlatform = platformFee ?? totalAmount * 0.30;
  const calculatedVendor = vendorAmount ?? totalAmount * 0.02;

  return (
    <Card className="stat-card-futuristic">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium">Financial Breakdown</CardTitle>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{currencySymbol}{totalAmount.toFixed(2)}</span>
          <Badge variant="outline" className="text-xs">{currency}</Badge>
        </div>
        
        {showBreakdown && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Artist (68%)</span>
              </div>
              <span className="text-sm font-medium text-primary">
                {currencySymbol}{calculatedArtist.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Platform (30%)</span>
              </div>
              <span className="text-sm font-medium">
                {currencySymbol}{calculatedPlatform.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-accent-foreground" />
                <span className="text-sm text-muted-foreground">Vendor (2%)</span>
              </div>
              <span className="text-sm font-medium text-accent-foreground">
                {currencySymbol}{calculatedVendor.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
