"use client";

import React, { useState, useMemo, useRef, ChangeEvent } from "react";
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
  AlertTriangle
} from "lucide-react";

import type { BillItem, Person, BillState } from "@/lib/types";
import { extractReceiptData } from "@/ai/flows/extract-receipt-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const initialBillState: BillState = {
  items: [],
  people: [],
  tax: 0,
  discount: 0,
  tip: 0,
  originalBillTotal: null,
  receiptImage: null,
  currency: "USD",
};

const personColors = [
  "bg-red-400", "bg-pink-400", "bg-purple-400", "bg-blue-400", 
  "bg-indigo-400", "bg-green-400", "bg-yellow-400", "bg-orange-400"
];

const SectionCard = ({ number, title, description, children }: { number: number, title: string, description?: string, children: React.ReactNode }) => (
    <Card className="w-full shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-bold text-primary flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3">{number}</span>
                {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

export default function BillEditor() {
  const [billState, setBillState] = useState<BillState>(initialBillState);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("split");
  const [splitMode, setSplitMode] = useState<"item" | "evenly">("item");
  const [newPersonName, setNewPersonName] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          });
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

  const { grandTotal, subtotal, reconciliation } = useMemo(() => {
    const subtotal = billState.items.reduce((acc, item) => acc + item.price, 0);
    const totalFromItems = subtotal - billState.discount + billState.tax + billState.tip;
    const billDifference = billState.originalBillTotal ? billState.originalBillTotal - totalFromItems : 0;
    const finalGrandTotal = billState.originalBillTotal ?? totalFromItems;

    const peopleTotalsMap = new Map<string, { total: number, items: BillItem[] }>(billState.people.map(p => [p.id, { total: 0, items: [] }]));
    const numberOfPeople = billState.people.length;

    if (numberOfPeople > 0) {
      if (splitMode === 'evenly') {
        const perPersonTotal = finalGrandTotal / numberOfPeople;
        billState.people.forEach(p => {
            const personTotal = peopleTotalsMap.get(p.id);
            if(personTotal) personTotal.total = perPersonTotal
        });
      } else {
        billState.items.forEach(item => {
          const assignees = item.assignedTo.filter(id => peopleTotalsMap.has(id));
          if (assignees.length > 0) {
            const pricePerPerson = item.price / assignees.length;
            assignees.forEach(personId => {
              const personTotal = peopleTotalsMap.get(personId);
              if(personTotal) {
                  personTotal.total += pricePerPerson;
                  personTotal.items.push(item);
              }
            });
          }
        });

        const sharedCosts = (billState.tax + billState.tip - billState.discount + billDifference) / numberOfPeople;
        peopleTotalsMap.forEach((value) => {
          value.total += sharedCosts;
        });
      }
    }

    const finalPeopleTotals = billState.people.map(p => {
        const personData = peopleTotalsMap.get(p.id);
        return {
            ...p,
            total: personData?.total || 0,
            items: personData?.items || [],
        }
    });

    const calculatedSum = finalPeopleTotals.reduce((acc, p) => acc + p.total, 0);
    const roundingDifference = finalGrandTotal - calculatedSum;
    if (finalPeopleTotals.length > 0) {
      finalPeopleTotals[finalPeopleTotals.length - 1].total += roundingDifference;
    }

    return { 
        grandTotal: finalGrandTotal, 
        subtotal,
        reconciliation: {
            subtotalAfterDiscount: subtotal - billState.discount,
            tax: billState.tax,
            calculatedTotal: subtotal - billState.discount + billState.tax,
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
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-2xl font-headline font-semibold text-primary">Analyzing Receipt...</h2>
            <p className="text-muted-foreground mt-2">Our AI is hard at work extracting items and prices.</p>
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
      <header className="flex justify-between items-center mb-6">
        <Logo showSubtitle />
        <div className="flex items-center gap-2">
           <Select defaultValue={billState.currency} onValueChange={(value) => setBillState(s => ({...s, currency: value}))}>
                <SelectTrigger className="w-24">
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

      <div className="flex items-center gap-2 mb-6">
          <Button onClick={() => setActiveTab('split')} variant={activeTab === 'split' ? 'default' : 'secondary'} className="w-full h-12 text-lg">Split</Button>
          <Button onClick={() => setActiveTab('summary')} variant={activeTab === 'summary' ? 'default' : 'secondary'} className="w-full h-12 text-lg">Summary</Button>
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
                        <div key={p.id} className={cn("flex items-center gap-2 text-white font-semibold pl-3 pr-1 py-1 rounded-full text-sm", personColors[i % personColors.length])}>
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
                                        <button key={p.id} onClick={() => toggleItemAssignment(item.id, p.id)} className={cn("w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center text-white relative transition-all", personColors[personIndex % personColors.length], isAssigned ? "ring-2 ring-offset-2 ring-primary" : "opacity-50 hover:opacity-100")}>
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
                <h3 className="font-semibold mb-2">Review & Adjust</h3>
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <Label>Original Receipt Subtotal</Label>
                        <Input type="number" value={subtotal.toFixed(2)} readOnly className="w-28 text-right bg-secondary" />
                     </div>
                     <div className="flex justify-between items-center">
                        <Label>Assigned Items Subtotal</Label>
                        <Input type="number" value={subtotal.toFixed(2)} readOnly className="w-28 text-right bg-secondary" />
                     </div>
                </div>
                <Button variant="outline" className="w-full my-4"><Plus className="mr-2"/> Add Global Discount</Button>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox id="tax" checked={billState.tax > 0} onCheckedChange={(checked) => setAdjustment('tax', checked ? (subtotal * 0.07) : 0)} />
                            <Label htmlFor="tax">Tax 7%</Label>
                        </div>
                        <Input type="number" value={billState.tax.toFixed(2)} onChange={e => setAdjustment('tax', parseFloat(e.target.value) || 0)} className="w-28 text-right" />
                    </div>
                </div>
                 <Button variant="outline" className="w-full my-4"><Plus className="mr-2"/> Add Other Tax / Fees</Button>
                
                <Separator className="my-4"/>

                <h3 className="font-semibold mb-2">Reconciliation</h3>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal After Discounts</span> <span>{formatCurrency(reconciliation.subtotalAfterDiscount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tax 7%</span> <span>{formatCurrency(reconciliation.tax)}</span></div>
                    <div className="flex justify-between font-bold"><span className="text-muted-foreground">Calculated Total</span> <span>{formatCurrency(reconciliation.calculatedTotal)}</span></div>
                </div>

                {reconciliation.billTotal && (
                    <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between font-bold text-base"><span className="text-muted-foreground">Bill Total (from receipt)</span> <span>{formatCurrency(reconciliation.billTotal)}</span></div>
                        
                        {Math.abs(reconciliation.shortfall) > 0.01 && (
                             <Alert variant={reconciliation.shortfall < 0 ? "default" : "destructive"} className="bg-yellow-100 border-yellow-300 text-yellow-800">
                                <AlertTriangle className="h-4 w-4 !text-yellow-600" />
                                <AlertTitle>Shortfall Detected</AlertTitle>
                                <AlertDescription>
                                    There's a difference of {formatCurrency(reconciliation.shortfall)}. This will be automatically added to split among everyone to match the bill total.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
                 <Button variant="outline" className="w-full my-4"><Plus className="mr-2"/> Add a tip</Button>
            </SectionCard>

            <div className="flex flex-col items-center gap-4 py-4">
                 <Button className="w-full h-12 text-lg" onClick={() => setActiveTab('summary')}>View Summary <ArrowRight className="ml-2"/></Button>
                 <Button variant="ghost" onClick={() => setBillState(initialBillState)}><RefreshCw className="mr-2"/> Start Over</Button>
            </div>
        </div>
      )}

      {activeTab === 'summary' && (
           <div className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline text-2xl">Final Summary</CardTitle>
                <CardDescription>Each person's share of the bill.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {billState.people.map(person => (
                    <Card key={person.id} className="bg-secondary/30">
                    <CardHeader className="flex flex-row justify-between items-center p-4">
                        <CardTitle className="text-xl font-headline">{person.name}</CardTitle>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(grandTotal / billState.people.length)}</div>
                    </CardHeader>
                    </Card>
                ))}
                <Separator />
                <div className="text-right font-bold text-2xl">
                    Grand Total: <span className="text-primary">{formatCurrency(grandTotal)}</span>
                </div>
                {billState.receiptImage && (
                    <>
                    <Separator />
                    <div>
                    <h3 className="text-lg font-medium mb-2">Attached Receipt</h3>
                    <Image src={billState.receiptImage} alt="Receipt" width={400} height={600} className="rounded-lg border shadow-sm w-full object-contain" />
                    </div>
                    </>
                )}
                </CardContent>
                <CardFooter className="gap-2">
                    <Button className="w-full"><ImageDown className="mr-2"/> Save as Image</Button>
                    <Button className="w-full" variant="secondary"><Share2 className="mr-2" /> Share Link</Button>
                </CardFooter>
            </Card>
            <div className="flex flex-col items-center gap-4 py-4">
                 <Button className="w-full h-12 text-lg" onClick={() => setActiveTab('split')}>Back to Edit</Button>
                 <Button variant="ghost" onClick={() => setBillState(initialBillState)}><RefreshCw className="mr-2"/> Start Over</Button>
            </div>
           </div>
      )}
    </div>
  );
}
