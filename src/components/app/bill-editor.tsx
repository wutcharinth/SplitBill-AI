"use client";

import React, { useState, useMemo, useRef, ChangeEvent, useEffect } from "react";
import {
  Camera,
  Upload,
  FilePlus2,
  Users,
  PlusCircle,
  Trash2,
  ChevronDown,
  ImageDown,
  Share2,
  Pen,
  Loader2,
  ArrowRight,
  RefreshCw,
  Plus,
  Star,
  Receipt,
  PiggyBank,
  Check,
  X,
  AlertTriangle,
  QrCode,
  List,
  Grip,
  Sparkles,
  PartyPopper
} from "lucide-react";

import type { BillItem, Person, BillState } from "@/lib/types";
import { extractReceiptData } from "@/ai/flows/extract-receipt-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ReactConfetti from 'react-confetti';
import { toPng } from 'html-to-image';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Logo from "./logo";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

const initialBillState: BillState = {
  items: [],
  people: [],
  tax: 0,
  discount: 0,
  tip: 0,
  originalBillTotal: null,
  receiptImage: null,
  currency: "USD",
  restaurantName: "Restaurant Name",
  billDate: new Date().toLocaleDateString(),
};

const personColors = [
  "border-red-500", "border-blue-500", "border-purple-500", "border-green-500", 
  "border-indigo-500", "border-pink-500", "border-yellow-500", "border-orange-500"
];
const personTextColors = [
  "text-red-500", "text-blue-500", "text-purple-500", "text-green-500", 
  "text-indigo-500", "text-pink-500", "text-yellow-500", "text-orange-500"
];

const SectionCard = ({ number, title, description, children, action, className }: { number?: number, title: string, description?: string, children: React.ReactNode, action?: React.ReactNode, className?: string }) => (
    <Card className={cn("w-full shadow-lg", className)}>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold text-primary flex items-center">
                    {number && <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3">{number}</span>}
                    {title}
                </CardTitle>
                {action}
            </div>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const loadingMessages = [
    "Scanning receipt edges...",
    "Finding items and prices...",
    "Calculating totals...",
    "Almost there...",
];

export default function BillEditor() {
  const [billState, setBillState] = useState<BillState>(initialBillState);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState("split");
  const [splitMode, setSplitMode] = useState<"item" | "evenly">("item");
  const [newPersonName, setNewPersonName] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [summaryView, setSummaryView] = useState<'detailed' | 'compact'>('detailed');
  const summaryRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      timer = setInterval(() => {
        setLoadingStep((prevStep) => (prevStep + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isLoading]);


  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const photoDataUri = reader.result as string;
        try {
          const result = await extractReceiptData({ photoDataUri });
          const newItems: BillItem[] = result.items.map((item) => ({
            id: crypto.randomUUID(),
            name: item.name,
            price: item.price,
            assignedTo: [],
          }));
          
          let people: Person[] = [];
          if(billState.people.length === 0){
              people.push({ id: crypto.randomUUID(), name: "P1" });
          } else {
              people = billState.people;
          }

          setBillState({
            ...initialBillState,
            items: newItems,
            originalBillTotal: result.total,
            receiptImage: photoDataUri,
            people: people,
            restaurantName: result.restaurantName || "Restaurant Name",
            billDate: result.date || new Date().toLocaleDateString(),
          });
          setActiveTab('summary');
        } catch (e) {
          console.error(e);
          toast({
            variant: "destructive",
            title: "AI Extraction Failed",
            description: "Could not extract data from the receipt. Please enter items manually.",
          });
          handleStartWithoutReceipt();
        } finally {
          setIsLoading(false);
        }
      };
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "There was a problem reading the uploaded file.",
      });
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleStartWithoutReceipt = () => {
    setBillState({
      ...initialBillState,
      people: [{ id: crypto.randomUUID(), name: "P1" }],
      items: [{id: crypto.randomUUID(), name: "First Item", price: 10, assignedTo:[]}]
    });
    setActiveTab('split');
  };

  const updateItem = (id: string, updates: Partial<BillItem>) => {
    setBillState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const addItem = () => {
    const newItem: BillItem = {
      id: crypto.randomUUID(),
      name: "",
      price: 0,
      assignedTo: [],
    };
    setBillState((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setBillState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const addPerson = () => {
    if(!newPersonName.trim()) return;
    setBillState((prev) => {
      const newPerson: Person = {
        id: crypto.randomUUID(),
        name: newPersonName.trim(),
      };
      setNewPersonName("");
      return { ...prev, people: [...prev.people, newPerson] };
    });
  };
  
  const updatePersonName = (id: string, name: string) => {
    setBillState((prev) => ({
        ...prev,
        people: prev.people.map((p) => (p.id === id ? { ...p, name } : p)),
    }));
  };

  const removePerson = (id: string) => {
    setBillState((prev) => ({
      ...prev,
      people: prev.people.filter((p) => p.id !== id),
      items: prev.items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((personId) => personId !== id),
      })),
    }));
  };

  const toggleItemAssignment = (itemId: string, personId: string) => {
    const item = billState.items.find(i => i.id === itemId);
    if (!item) return;

    const isAssigned = item.assignedTo.includes(personId);
    const newAssignedTo = isAssigned
      ? item.assignedTo.filter(id => id !== personId)
      : [...item.assignedTo, personId];
    
    updateItem(itemId, { assignedTo: newAssignedTo });
  };
  
  const setAdjustment = (key: 'tax' | 'discount' | 'tip', value: number) => {
    setBillState(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAsImage = () => {
    if (summaryRef.current === null) {
      return;
    }

    toPng(summaryRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'bill-summary.png';
        link.href = dataUrl;
        link.click();
        setShowConfetti(true);
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: 'destructive',
          title: 'Oops!',
          description: 'Could not save summary as image.',
        });
      });
  };

  const { grandTotal, subtotal, reconciliation, peopleTotals } = useMemo(() => {
    const subtotal = billState.items.reduce((acc, item) => acc + item.price, 0);
    const totalFromItems = subtotal - billState.discount + billState.tax + billState.tip;
    const billDifference = billState.originalBillTotal ? billState.originalBillTotal - totalFromItems : 0;
    const finalGrandTotal = billState.originalBillTotal ?? totalFromItems;

    const peopleTotalsMap = new Map<string, { total: number, items: {name: string, price: number}[], tax: number, tip: number, discount: number, shared: number }>(billState.people.map(p => [p.id, { total: 0, items: [], tax: 0, tip: 0, discount: 0, shared: 0 }]));
    const numberOfPeople = billState.people.length;

    if (numberOfPeople > 0) {
      if (splitMode === 'evenly') {
        const perPersonTotal = finalGrandTotal / numberOfPeople;
        billState.people.forEach(p => {
            const personData = peopleTotalsMap.get(p.id);
            if(personData) {
              personData.total = perPersonTotal;
              personData.items = billState.items.map(i => ({name: i.name, price: i.price / numberOfPeople}));
              personData.tax = billState.tax / numberOfPeople;
              personData.tip = billState.tip / numberOfPeople;
              personData.discount = billState.discount / numberOfPeople;
            }
        });
      } else {
        billState.items.forEach(item => {
          const assignees = item.assignedTo.filter(id => peopleTotalsMap.has(id));
          if (assignees.length > 0) {
            const pricePerPerson = item.price / assignees.length;
            assignees.forEach(personId => {
              const personData = peopleTotalsMap.get(personId);
              if(personData) {
                  personData.total += pricePerPerson;
                  personData.items.push({name: item.name, price: pricePerPerson});
              }
            });
          }
        });

        peopleTotalsMap.forEach((personData) => {
          const personSubtotal = personData.total;
          const proportionOfSubtotal = subtotal > 0 ? personSubtotal / subtotal : 1 / numberOfPeople;
          
          personData.tax = billState.tax * proportionOfSubtotal;
          personData.tip = billState.tip * proportionOfSubtotal;
          personData.discount = billState.discount * proportionOfSubtotal;
          personData.shared = billDifference * proportionOfSubtotal;

          personData.total += personData.tax + personData.tip - personData.discount + personData.shared;
        });
      }
    }

    const finalPeopleTotals = billState.people.map(p => {
        const personData = peopleTotalsMap.get(p.id);
        return {
            ...p,
            total: personData?.total || 0,
            items: personData?.items || [],
            tax: personData?.tax || 0,
            tip: personData?.tip || 0,
            discount: personData?.discount || 0,
            shared: personData?.shared || 0,
        }
    });

    const calculatedSum = finalPeopleTotals.reduce((acc, p) => acc + p.total, 0);
    const roundingDifference = finalGrandTotal - calculatedSum;
    if (finalPeopleTotals.length > 0 && Math.abs(roundingDifference) > 0.001) {
      finalPeopleTotals[finalPeopleTotals.length - 1].total += roundingDifference;
    }

    return { 
        grandTotal: finalGrandTotal, 
        subtotal,
        reconciliation: {
            subtotalAfterDiscount: subtotal - billState.discount,
            tax: billState.tax,
            tip: billState.tip,
            calculatedTotal: subtotal - billState.discount + billState.tax + billState.tip,
            billTotal: billState.originalBillTotal,
            shortfall: billDifference
        },
        peopleTotals: finalPeopleTotals
    };
  }, [billState, splitMode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: billState.currency, minimumFractionDigits: 2 }).format(amount);
  };
  
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
            <div className="relative mb-6">
                <Loader2 className="h-24 w-24 text-primary opacity-20" />
                <Sparkles className="h-16 w-16 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-2xl font-headline font-semibold text-primary transition-all duration-500">{loadingMessages[loadingStep]}</h2>
            <div className="w-full max-w-xs mt-4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-2000 ease-linear" style={{ width: `${(loadingStep + 1) * 25}%` }}></div>
            </div>
        </div>
    )
  }

  if (billState.items.length === 0 && billState.originalBillTotal === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 zoom-in-95 duration-500 border-none bg-transparent">
          <CardHeader>
            <Logo />
            <p className="text-muted-foreground pt-2">The smartest way to split the bill.</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <Button size="lg" onClick={() => fileInputRef.current?.click()}>
              <Camera className="mr-2" /> Take a Picture
            </Button>
            <Button size="lg" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2" /> Upload from Library
            </Button>
            <Button size="lg" variant="ghost" onClick={handleStartWithoutReceipt}>
              <FilePlus2 className="mr-2" /> Start without Receipt
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 font-body">
      {showConfetti && <ReactConfetti width={window.innerWidth} height={window.innerHeight} onConfettiComplete={() => setShowConfetti(false)} recycle={false} numberOfPieces={400} />}
      <header className="flex justify-between items-center mb-6">
        <Logo showSubtitle />
        <div className="flex items-center gap-2">
           <Select defaultValue={billState.currency} onValueChange={(value) => setBillState(s => ({...s, currency: value}))}>
                <SelectTrigger className="w-28">
                    <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="THB">THB</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="ghost" size="icon"><Star /></Button>
        </div>
      </header>

      <div className="flex items-center gap-2 mb-6 p-1 bg-primary/10 rounded-lg">
          <Button onClick={() => setActiveTab('split')} variant={activeTab === 'split' ? 'default' : 'ghost'} className="w-full h-12 text-lg">Split</Button>
          <Button onClick={() => setActiveTab('summary')} variant={activeTab === 'summary' ? 'default' : 'ghost'} className="w-full h-12 text-lg">Summary</Button>
      </div>

      {activeTab === 'split' && (
        <div className="space-y-6">
            <SectionCard number={1} title="Split Mode">
                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                    <Button onClick={() => setSplitMode('item')} variant={splitMode === 'item' ? 'default' : 'ghost'} className="w-full">Split by Item</Button>
                    <Button onClick={() => setSplitMode('evenly')} variant={splitMode === 'evenly' ? 'default' : 'ghost'} className="w-full">Split Evenly</Button>
                </div>
            </SectionCard>
            
            <SectionCard number={2} title="Manage People" description="Add or remove people to split the bill with.">
                <div className="flex flex-wrap gap-2 mb-4">
                    {billState.people.map((p, i) => (
                        <div key={p.id} className={cn("flex items-center gap-2 text-white font-semibold pl-3 pr-1 py-1 rounded-full text-sm", personColors[i % personColors.length].replace('border-','bg-'))}>
                            {p.name}
                            <button onClick={() => removePerson(p.id)} className="bg-black/20 hover:bg-black/40 rounded-full p-0.5"><X className="w-3 h-3"/></button>
                        </div>
                    ))}
                </div>
                 <div className="flex gap-2">
                    <Input placeholder="Enter name and press Add" value={newPersonName} onChange={e => setNewPersonName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPerson()} />
                    <Button onClick={addPerson}><Plus/></Button>
                 </div>
            </SectionCard>

            <SectionCard number={3} title="Assign Items" description="Assign items by tapping a person's icon to add a share. Tap again to remove a share.">
                <div className="space-y-2">
                  {billState.items.map((item, itemIndex) => (
                    <div key={item.id} className="p-4 rounded-lg border">
                      <div className="flex items-start gap-4">
                        <div className="flex-grow space-y-2">
                           <Input
                                value={item.name}
                                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                placeholder="Item Name"
                                className="text-base font-semibold border-none px-0 h-auto focus-visible:ring-0"
                            />
                            <div className="flex flex-wrap gap-2">
                                {billState.people.map((p, personIndex) => {
                                    const isAssigned = item.assignedTo.includes(p.id);
                                    return (
                                        <button key={p.id} onClick={() => toggleItemAssignment(item.id, p.id)} className={cn("w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center text-white relative transition-all", personColors[personIndex % personColors.length].replace('border-', 'bg-'), isAssigned ? "ring-2 ring-offset-2 ring-primary" : "opacity-50 hover:opacity-100")}>
                                            {p.name.substring(0, 2)}
                                            {isAssigned && (
                                                <div className="absolute -top-1 -right-1 bg-primary rounded-full h-4 w-4 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-primary-foreground"/>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                className="w-24 text-right font-semibold border-none focus-visible:ring-0"
                            />
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                 <Button variant="outline" className="mt-4 w-full" onClick={addItem}><PlusCircle className="mr-2"/> Quick Add Item</Button>
            </SectionCard>

            <SectionCard number={4} title="Adjustments & Reconciliation">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Subtotal</Label>
                    <Input type="number" value={subtotal.toFixed(2)} readOnly className="w-28 text-right bg-secondary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discount">Discount</Label>
                    <Input id="discount" type="number" value={billState.discount} onChange={e => setAdjustment('discount', parseFloat(e.target.value) || 0)} className="w-28 text-right" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tax">Tax</Label>
                    <Input id="tax" type="number" value={billState.tax} onChange={e => setAdjustment('tax', parseFloat(e.target.value) || 0)} className="w-28 text-right" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tip">Tip</Label>
                    <Input id="tip" type="number" value={billState.tip} onChange={e => setAdjustment('tip', parseFloat(e.target.value) || 0)} className="w-28 text-right" />
                  </div>
                </div>

                <Separator className="my-4"/>

                <h3 className="font-semibold mb-2">Reconciliation</h3>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal After Discounts</span> <span>{formatCurrency(reconciliation.subtotalAfterDiscount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tax</span> <span>{formatCurrency(reconciliation.tax)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tip</span> <span>{formatCurrency(reconciliation.tip)}</span></div>
                    <div className="flex justify-between font-bold"><span className="text-muted-foreground">Calculated Total</span> <span>{formatCurrency(reconciliation.calculatedTotal)}</span></div>
                </div>

                {reconciliation.billTotal && (
                    <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between font-bold text-base"><span className="text-muted-foreground">Bill Total (from receipt)</span> <span>{formatCurrency(reconciliation.billTotal)}</span></div>
                        
                        {Math.abs(reconciliation.shortfall) > 0.01 && (
                             <Alert variant={reconciliation.shortfall > 0 ? "default" : "destructive"} className={cn(reconciliation.shortfall > 0 ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-yellow-100 border-yellow-300 text-yellow-800")}>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Adjustment Needed</AlertTitle>
                                <AlertDescription>
                                    There's a difference of {formatCurrency(reconciliation.shortfall)}. This will be automatically split among everyone to match the bill total.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </SectionCard>

            <div className="flex flex-col items-center gap-4 py-4">
                 <Button className="w-full h-12 text-lg" onClick={() => setActiveTab('summary')}>View Summary <ArrowRight className="ml-2"/></Button>
                 <Button variant="ghost" onClick={() => setBillState(initialBillState)}><RefreshCw className="mr-2"/> Start Over</Button>
            </div>
        </div>
      )}

      {activeTab === 'summary' && (
           <div className="space-y-6">
                <Card ref={summaryRef} className="p-6 bg-white">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-semibold text-primary">Final Summary</h2>
                  </div>
                  
                  <Card>
                      <CardHeader className="flex-row items-center justify-between">
                          <div>
                              <CardTitle>{billState.restaurantName}</CardTitle>
                              <CardDescription>{billState.billDate}</CardDescription>
                          </div>
                           <Button variant="ghost" size="sm"><Receipt className="mr-2"/>Change Split Options</Button>
                      </CardHeader>
                  </Card>

                  <div className="my-4">
                    <h3 className="font-semibold text-primary mb-2">Split Summary</h3>
                    <Accordion type="multiple" defaultValue={peopleTotals.map(p => p.id)}>
                        {peopleTotals.map((person, index) => (
                            <AccordionItem value={person.id} key={person.id} className="border-b-0 mb-2">
                                <Card className={cn("border-l-4", personColors[index % personColors.length])}>
                                    <AccordionTrigger className="p-4 hover:no-underline">
                                        <div className="flex justify-between items-center w-full">
                                            <span className="font-bold text-lg">{person.name}</span>
                                            <span className={cn("font-bold text-lg", personTextColors[index % personTextColors.length])}>{formatCurrency(person.total)}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-1 text-muted-foreground">
                                            {person.items.map((item, itemIdx) => (
                                                <div key={itemIdx} className="flex justify-between text-sm">
                                                    <span>{item.name}</span>
                                                    <span>{formatCurrency(item.price)}</span>
                                                </div>
                                            ))}
                                            <Separator className="my-2"/>
                                            {person.tax > 0 && <div className="flex justify-between text-sm"><span>Tax</span><span>{formatCurrency(person.tax)}</span></div>}
                                            {person.tip > 0 && <div className="flex justify-between text-sm"><span>Tip</span><span>{formatCurrency(person.tip)}</span></div>}
                                            {person.discount > 0 && <div className="flex justify-between text-sm"><span>Discount</span><span>-{formatCurrency(person.discount)}</span></div>}
                                            {Math.abs(person.shared) > 0.01 && <div className="flex justify-between text-sm"><span>Adjustment</span><span>{formatCurrency(person.shared)}</span></div>}
                                        </div>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        ))}
                    </Accordion>
                  </div>
                  
                  <div className="my-4">
                      <h3 className="font-semibold text-primary mb-2">Reconciliation Summary</h3>
                      <Card className="p-4">
                          <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal After Item Splits</span> <span>{formatCurrency(subtotal)}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Tax and Other Fees</span> <span>{formatCurrency(reconciliation.tax + reconciliation.tip - reconciliation.discount)}</span></div>
                              <Separator className="my-1"/>
                              <div className="flex justify-between font-bold"><span className="text-muted-foreground">Calculated Total</span> <span>{formatCurrency(reconciliation.calculatedTotal)}</span></div>
                              {Math.abs(reconciliation.shortfall) > 0.01 && <div className="flex justify-between"><span className="text-blue-600">Adjustment (to match receipt)</span> <span className="text-blue-600 font-bold">{formatCurrency(reconciliation.shortfall)}</span></div>}
                          </div>
                      </Card>
                  </div>

                  <div className="flex justify-between items-center font-bold text-2xl mt-4 p-4 bg-muted rounded-lg">
                      <span>Grand Total:</span>
                      <span className="text-primary">{formatCurrency(grandTotal)}</span>
                  </div>

                  {billState.receiptImage && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-primary mb-2">Attached Receipt</h3>
                      <Image src={billState.receiptImage} alt="Receipt" width={400} height={600} className="rounded-lg border shadow-sm w-full object-contain" />
                    </div>
                  )}
                  
                  <div className="mt-6 space-y-4">
                      <div>
                          <h3 className="font-semibold text-primary mb-2 text-center">Payment QR Code</h3>
                          <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg">
                              <div className="text-center text-muted-foreground">
                                  <Image src="https://placehold.co/150x150.png" alt="QR Code" width={150} height={150} data-ai-hint="qr code" />
                                  <p className="text-xs mt-2">Scan QR code to pay</p>
                              </div>
                          </div>
                      </div>
                      <div className="relative">
                          <PartyPopper className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input className="pl-10" placeholder="Add QR payment info or other notes" />
                      </div>
                      <div className="flex items-center gap-2">
                          <Checkbox id="attach-receipt" defaultChecked />
                          <Label htmlFor="attach-receipt">Attach receipt image to summary</Label>
                      </div>
                  </div>
                </Card>

                <div className="flex flex-col items-center gap-2 mt-6">
                    <Button className="w-full h-12 text-lg" onClick={handleSaveAsImage}><ImageDown className="mr-2"/> Save Summary as Image</Button>
                    <Button variant="ghost" onClick={() => setBillState(initialBillState)}><RefreshCw className="mr-2"/> Start Over</Button>
                </div>

                <div className="flex flex-col items-center gap-4 py-4">
                     <Button className="w-full h-12 text-lg" onClick={() => setActiveTab('split')}>Back to Edit</Button>
                </div>
           </div>
      )}
    </div>
  );
}
