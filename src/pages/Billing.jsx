import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Check, 
  Download,
  Calendar,
  ArrowRight,
  Building2,
  Banknote,
  Sparkles,
  Crown
} from "lucide-react";
import { useState } from "react";

const GEMINI_API_KEY = "AIzaSyD7W9BzMGKrVnaIa2fXA7lNCo9BYh_WPsQ";

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [payoutMethod, setPayoutMethod] = useState('bank');

  const plans = [
    {
      name: "Wöchentlich",
      value: "weekly",
      price: "9.99",
      period: "/Woche",
      savings: "",
      gradient: "from-blue-500 to-cyan-600",
      features: [
        "Unbegrenzte Trend-Analysen",
        "50 AI-generierte Videos/Woche",
        "Multi-Platform Posting",
        "Basis Analytics",
        "Email Support"
      ]
    },
    {
      name: "Monatlich",
      value: "monthly",
      price: "29.99",
      period: "/Monat",
      savings: "25% Ersparnis",
      popular: true,
      gradient: "from-purple-500 to-pink-600",
      features: [
        "Alles aus Wöchentlich",
        "200 AI-generierte Videos/Monat",
        "Erweiterte Analytics",
        "Prioritäts-Support",
        "Auto-Pilot Modus",
        "Team Kollaboration"
      ]
    },
    {
      name: "Jährlich",
      value: "yearly",
      price: "249.99",
      period: "/Jahr",
      savings: "50% Ersparnis",
      gradient: "from-yellow-500 to-orange-600",
      features: [
        "Alles aus Monatlich",
        "Unbegrenzte AI-Videos",
        "White Label Option",
        "API Zugang",
        "Dedizierter Account Manager",
        "Custom Integrationen"
      ]
    }
  ];

  const earnings = {
    thisWeek: "156.80",
    thisMonth: "642.30",
    pending: "89.50",
    lifetime: "2,847.90"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Abrechnung & Zahlungen</h1>
          <p className="text-slate-400 mt-1">
            Verwalte dein Abonnement und Auszahlungen
          </p>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-800/30 border-slate-700/50 hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-slate-400 font-medium">Diese Woche</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mt-1">${earnings.thisWeek}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-xs text-green-400 font-semibold">+12.5% vs letzte Woche</p>
        </Card>

        <Card className="p-6 bg-slate-800/30 border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-slate-400 font-medium">Dieser Monat</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mt-1">${earnings.thisMonth}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-blue-400 font-semibold">+8.3% vs letzter Monat</p>
        </Card>

        <Card className="p-6 bg-slate-800/30 border-slate-700/50 hover:border-yellow-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-slate-400 font-medium">Ausstehend</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mt-1">${earnings.pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <Wallet className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Auszahlung in 3 Tagen</p>
        </Card>

        <Card className="p-6 bg-slate-800/30 border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-slate-400 font-medium">Gesamt</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mt-1">${earnings.lifetime}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Lifetime Earnings</p>
        </Card>
      </div>

      {/* Subscription Plans */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-slate-100">Wähle dein Abo</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.value}
              className={`relative p-6 bg-slate-800/30 border-2 transition-all duration-300 hover:scale-105 ${
                selectedPlan === plan.value
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : plan.popular
                  ? 'border-pink-500/50 shadow-lg shadow-pink-500/20'
                  : 'border-slate-700/50'
              }`}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5 rounded-2xl`} />
              
              <div className="relative">
                {plan.popular && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold shadow-lg">
                      <Sparkles size={12} />
                      Beliebteste Wahl
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-slate-100 mb-3">{plan.name}</h3>
                
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-5xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>${plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                
                {plan.savings && (
                  <p className={`text-sm font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent mb-6`}>{plan.savings}</p>
                )}

                <Button
                  onClick={() => setSelectedPlan(plan.value)}
                  className={`w-full mb-6 font-medium rounded-xl py-6 transition-all duration-300 ${
                    selectedPlan === plan.value
                      ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg`
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                  }`}
                >
                  {selectedPlan === plan.value ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Ausgewählt
                    </>
                  ) : (
                    <>
                      Auswählen
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`h-5 w-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card className="p-6 bg-gradient-card shadow-card border-border">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Zahlungsmethode
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber" className="text-foreground">Kartennummer</Label>
              <input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry" className="text-foreground">Ablaufdatum</Label>
                <input
                  id="expiry"
                  type="text"
                  placeholder="MM/YY"
                  className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="text-foreground">CVV</Label>
                <input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cardName" className="text-foreground">Name auf der Karte</Label>
              <input
                id="cardName"
                type="text"
                placeholder="Max Mustermann"
                className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
              />
            </div>
            
            <div>
              <Label htmlFor="country" className="text-foreground">Land</Label>
              <select
                id="country"
                className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
              >
                <option>Deutschland</option>
                <option>Österreich</option>
                <option>Schweiz</option>
                <option>Andere</option>
              </select>
            </div>
          </div>
        </div>

        <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300">
          <CreditCard className="w-4 h-4 mr-2" />
          Zahlungsmethode speichern
        </Button>
      </Card>

      {/* Payout Settings */}
      <Card className="p-6 bg-gradient-card shadow-card border-border">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Auszahlungseinstellungen
        </h2>

        <div className="mb-6">
          <Label className="text-foreground mb-3 block">Auszahlungsmethode wählen</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setPayoutMethod('bank')}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                payoutMethod === 'bank'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/50 hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${payoutMethod === 'bank' ? 'bg-primary/20' : 'bg-secondary'}`}>
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Banküberweisung</p>
                  <p className="text-xs text-muted-foreground">SEPA, 1-2 Werktage</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setPayoutMethod('crypto')}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                payoutMethod === 'crypto'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-secondary/50 hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${payoutMethod === 'crypto' ? 'bg-primary/20' : 'bg-secondary'}`}>
                  <Banknote className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Crypto Wallet</p>
                  <p className="text-xs text-muted-foreground">USDT, ETH, BTC - Sofort</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {payoutMethod === 'bank' ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="iban" className="text-foreground">IBAN</Label>
              <input
                id="iban"
                type="text"
                placeholder="DE89 3704 0044 0532 0130 00"
                className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
              />
            </div>
            
            <div>
              <Label htmlFor="accountHolder" className="text-foreground">Kontoinhaber</Label>
              <input
                id="accountHolder"
                type="text"
                placeholder="Max Mustermann"
                className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
              />
            </div>

            <div>
              <Label htmlFor="bankName" className="text-foreground">Bank Name</Label>
              <input
                id="bankName"
                type="text"
                placeholder="Deutsche Bank"
                className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="walletType" className="text-foreground">Crypto-Typ</Label>
              <select
                id="walletType"
                className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
              >
                <option>USDT (TRC-20)</option>
                <option>USDT (ERC-20)</option>
                <option>ETH (Ethereum)</option>
                <option>BTC (Bitcoin)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="walletAddress" className="text-foreground">Wallet Adresse</Label>
              <input
                id="walletAddress"
                type="text"
                placeholder="0x1234...5678"
                className="w-full mt-2 p-3 rounded-lg bg-secondary border border-border text-foreground focus:border-primary transition-all duration-300"
              />
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/50">
              <p className="text-sm text-warning flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>Stelle sicher, dass die Wallet-Adresse korrekt ist. Falsche Adressen können zu Verlusten führen.</span>
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <Button className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300">
            <Wallet className="w-4 h-4 mr-2" />
            Auszahlungsmethode speichern
          </Button>
          <Button 
            variant="outline" 
            className="border-border hover:border-primary transition-all duration-300"
            disabled={parseFloat(earnings.pending) < 50}
          >
            <Download className="w-4 h-4 mr-2" />
            Jetzt auszahlen (${earnings.pending})
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          * Mindestauszahlung: $50.00 | Auszahlungen werden jeden Montag verarbeitet
        </p>
      </Card>

      {/* Transaction History */}
      <Card className="p-6 bg-gradient-card shadow-card border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Transaktionsverlauf</h2>
        
        <div className="space-y-3">
          {[
            { date: "18. Nov 2024", type: "Auszahlung", amount: "-$245.00", status: "Abgeschlossen", color: "text-success" },
            { date: "11. Nov 2024", type: "Abonnement", amount: "-$29.99", status: "Bezahlt", color: "text-primary" },
            { date: "04. Nov 2024", type: "Auszahlung", amount: "-$189.50", status: "Abgeschlossen", color: "text-success" },
            { date: "01. Nov 2024", type: "Bonus", amount: "+$50.00", status: "Gutgeschrieben", color: "text-warning" },
          ].map((transaction, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{transaction.type}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${transaction.color}`}>{transaction.amount}</p>
                <p className="text-xs text-muted-foreground">{transaction.status}</p>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-4 border-border hover:border-primary transition-all duration-300">
          Alle Transaktionen anzeigen
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>

      {/* Support Section */}
      <Card className="p-6 bg-gradient-card shadow-card border-border">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Fragen zur Abrechnung?</h3>
          <p className="text-muted-foreground mb-4">
            Unser Support-Team hilft dir bei allen Fragen zu Zahlungen und Abrechnungen.
          </p>
          <a 
            href="mailto:brutusaiswebapp@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <DollarSign className="w-5 h-5" />
            brutusaiswebapp@gmail.com
          </a>
          <p className="text-xs text-muted-foreground mt-4">
            ⚡ Antwortzeit: 24 Stunden | 🔒 Sichere Kommunikation
          </p>
        </div>
      </Card>
    </div>
  );
}
