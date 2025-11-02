"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Minus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";

type ActionsCardProps = {
  balance: number;
  onDeposit: (amount: number, description: string) => void;
  onWithdraw: (amount: number, description: string) => void;
};

const DepositFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than zero." }).max(10000, { message: "Deposit cannot exceed $10,000." }),
  description: z.string().min(1, "Description is required.").max(50, "Description is too long."),
});

const WithdrawFormSchema = (balance: number) => z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than zero." }).max(balance, { message: "Insufficient funds." }),
  description: z.string().min(1, "Description is required.").max(50, "Description is too long."),
});


export function ActionsCard({ balance, onDeposit, onWithdraw }: ActionsCardProps) {
  const { toast } = useToast();
  const [isDepositOpen, setDepositOpen] = React.useState(false);
  const [isWithdrawOpen, setWithdrawOpen] = React.useState(false);

  const depositForm = useForm<z.infer<typeof DepositFormSchema>>({
    resolver: zodResolver(DepositFormSchema),
    defaultValues: { amount: '' as any, description: "" },
  });

  const withdrawForm = useForm<z.infer<ReturnType<typeof WithdrawFormSchema>>>({
    resolver: zodResolver(WithdrawFormSchema(balance)),
    defaultValues: { amount: '' as any, description: "" },
  });
  
  React.useEffect(() => {
    withdrawForm.reset();
  }, [balance, withdrawForm]);


  function handleDepositSubmit(values: z.infer<typeof DepositFormSchema>) {
    onDeposit(values.amount, values.description);
    toast({
      title: "Deposit Successful",
      description: `You have deposited $${values.amount.toFixed(2)}.`,
    });
    depositForm.reset({ amount: '' as any, description: '' });
    setDepositOpen(false);
  }
  
  function handleWithdrawSubmit(values: z.infer<ReturnType<typeof WithdrawFormSchema>>) {
    onWithdraw(values.amount, values.description);
    toast({
      title: "Withdrawal Successful",
      description: `You have withdrawn $${values.amount.toFixed(2)}.`,
      variant: "default",
    });
    withdrawForm.reset({ amount: '' as any, description: '' });
    setWithdrawOpen(false);
  }

  return (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Deposit or withdraw funds.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Dialog open={isDepositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full">
              <Plus className="mr-2" /> Deposit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>Enter the amount and a description for your deposit.</DialogDescription>
            </DialogHeader>
            <Form {...depositForm}>
              <form onSubmit={depositForm.handleSubmit(handleDepositSubmit)} className="space-y-4">
                <FormField control={depositForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={depositForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Paycheck, Gift" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit">Deposit</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isWithdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogTrigger asChild>
            <Button size="lg" variant="secondary" className="w-full">
              <Minus className="mr-2" /> Withdraw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>Enter the amount and a description for your withdrawal.</DialogDescription>
            </DialogHeader>
             <Form {...withdrawForm}>
              <form onSubmit={withdrawForm.handleSubmit(handleWithdrawSubmit)} className="space-y-4">
                <FormField control={withdrawForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={withdrawForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ATM, Online Purchase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit" variant="destructive">Withdraw</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
