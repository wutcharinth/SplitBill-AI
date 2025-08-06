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
} from "lucide-react";

import type { BillItem, Person, BillState } from "@/lib/types";
import { extractReceiptData } from "@/ai/flows/extract-receipt-data";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

export default function BillEditor() {
  const [billState, setBillState] = useState<BillState>(initialBillState);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("split");
  const [splitMode, setSplitMode] = useState<"item" | "evenly">("item");
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
          const newPerson: Person = { id: crypto.randomUUID(), name: "Person 1" };

          setBillState({
            ...initialBillState,
            items: newItems,
            originalBillTotal: result.total,
            receiptImage: photoDataUri,
            people: [newPerson],
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
      people: [{ id: crypto.randomUUID(), name: "Person 1" }],
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
      name: "New Item",
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
    setBillState((prev) => {
      const newPerson: Person = {
        id: crypto.randomUUID(),
        name: `Person ${prev.people.length + 1}`,
      };
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
  
  const setAdjustment = (key: 'tax' | 'discount' | 'tip', value: number) => {
    setBillState(prev => ({ ...prev, [key]: value }));
  };

  const { grandTotal, peopleTotals } = useMemo(() => {
    const subtotal = billState.items.reduce((acc, item) => acc + item.price, 0);
    const grandTotal = subtotal - billState.discount + billState.tax + billState.tip;

    const peopleTotalsMap = new Map<string, number>(billState.people.map(p => [p.id, 0]));
    const numberOfPeople = billState.people.length;

    if (numberOfPeople > 0) {
      if (splitMode === 'evenly') {
        const perPersonTotal = grandTotal / numberOfPeople;
        billState.people.forEach(p => peopleTotalsMap.set(p.id, perPersonTotal));
      } else {
        billState.items.forEach(item => {
          const assignees = item.assignedTo.filter(id => peopleTotalsMap.has(id));
          if (assignees.length > 0) {
            const pricePerPerson = item.price / assignees.length;
            assignees.forEach(personId => {
              peopleTotalsMap.set(personId, (peopleTotalsMap.get(personId) || 0) + pricePerPerson);
            });
          }
        });

        const sharedTotal = billState.tax + billState.tip - billState.discount;
        const sharedPerPerson = sharedTotal / numberOfPeople;
        billState.people.forEach(p => {
            peopleTotalsMap.set(p.id, (peopleTotalsMap.get(p.id) || 0) + sharedPerPerson);
        });
      }
    }

    const finalPeopleTotals = billState.people.map(p => ({
        ...p,
        total: peopleTotalsMap.get(p.id) || 0
    }));

    const calculatedSum = finalPeopleTotals.reduce((acc, p) => acc + p.total, 0);
    const difference = grandTotal - calculatedSum;
    if (finalPeopleTotals.length > 0) {
      finalPeopleTotals[finalPeopleTotals.length - 1].total += difference;
    }

    return { grandTotal, peopleTotals: finalPeopleTotals };
  }, [billState, splitMode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: billState.currency }).format(amount);
  };
  
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-2xl font-headline font-semibold text-primary">Analyzing Receipt...</h2>
            <p className="text-muted-foreground mt-2">Our AI is hard at work extracting items and prices.</p>
        </div>
    )
  }

  if (billState.items.length === 0 && billState.originalBillTotal === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 zoom-in-95 duration-500">
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
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <header className="flex justify-between items-center mb-6">
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setBillState(initialBillState)}>
            <PlusCircle />
            <span className="sr-only">New Bill</span>
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="split">Split</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="split">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Split Details</CardTitle>
                <div className="flex items-center gap-4 pt-4">
                    <Label>Split Mode</Label>
                    <Button variant={splitMode === 'item' ? 'default' : 'outline'} onClick={() => setSplitMode('item')}>By Item</Button>
                    <Button variant={splitMode === 'evenly' ? 'default' : 'outline'} onClick={() => setSplitMode('evenly')}>Evenly</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-lg font-medium">People</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {billState.people.map((person) => (
                    <div key={person.id} className="flex items-center gap-2 bg-secondary p-2 rounded-lg">
                      <Users className="text-primary" />
                      <Input value={person.name} onChange={(e) => updatePersonName(person.id, e.target.value)} className="w-28 h-8 font-semibold"/>
                      {billState.people.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePerson(person.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="icon" onClick={addPerson}><PlusCircle /></Button>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-lg font-medium">Items</Label>
                <div className="space-y-4 mt-2">
                  {billState.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                        placeholder="Item Name"
                        className="flex-grow"
                      />
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                        placeholder="Price"
                        className="w-24"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="outline" disabled={splitMode === 'evenly'}>
                            {item.assignedTo.length > 0 ? `${item.assignedTo.length} person(s)` : 'Assign'}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56">
                          <div className="grid gap-4">
                            <h4 className="font-medium leading-none">Assign to</h4>
                            <div className="grid gap-2">
                              {billState.people.map(person => (
                                <div key={person.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${item.id}-${person.id}`}
                                    checked={item.assignedTo.includes(person.id)}
                                    onCheckedChange={(checked) => {
                                      const newAssignedTo = checked
                                        ? [...item.assignedTo, person.id]
                                        : item.assignedTo.filter(id => id !== person.id);
                                      updateItem(item.id, { assignedTo: newAssignedTo });
                                    }}
                                  />
                                  <label htmlFor={`${item.id}-${person.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {person.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </div>
                  ))}
                </div>
                 <Button variant="outline" className="mt-4" onClick={addItem}><PlusCircle className="mr-2"/> Add Item</Button>
              </div>
              <Separator />
              <div>
                <Label className="text-lg font-medium">Adjustments</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="space-y-1">
                        <Label htmlFor="discount">Discount (-)</Label>
                        <Input id="discount" type="number" value={billState.discount} onChange={e => setAdjustment('discount', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="tax">Tax (+)</Label>
                        <Input id="tax" type="number" value={billState.tax} onChange={e => setAdjustment('tax', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="tip">Tip (+)</Label>
                        <Input id="tip" type="number" value={billState.tip} onChange={e => setAdjustment('tip', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                    </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start space-y-2 text-lg font-semibold bg-secondary/30 p-4 rounded-b-lg">
                <div className="flex justify-between w-full"><span>Calculated Total:</span> <span>{formatCurrency(grandTotal)}</span></div>
                {billState.originalBillTotal && <div className="flex justify-between w-full"><span>Original Bill:</span> <span>{formatCurrency(billState.originalBillTotal)}</span></div>}
                {billState.originalBillTotal && <div className="flex justify-between w-full text-primary"><span>Difference:</span> <span>{formatCurrency(grandTotal - billState.originalBillTotal)}</span></div>}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Final Summary</CardTitle>
              <p className="text-muted-foreground">Each person's share of the bill.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {peopleTotals.map(person => (
                <Card key={person.id} className="bg-secondary/30">
                  <CardHeader className="flex flex-row justify-between items-center p-4">
                    <CardTitle className="text-xl font-headline">{person.name}</CardTitle>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(person.total)}</div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
