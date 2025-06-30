import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const serverFormSchema = z.object({
  server_name: z.string().min(1, 'Server name is required').max(50, 'Server name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
});

type ServerFormData = z.infer<typeof serverFormSchema>;

interface AddServerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddServerForm({ open, onOpenChange }: AddServerFormProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const form = useForm<ServerFormData>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      server_name: '',
      description: '',
    },
  });

  // Create server mutation
  const createServerMutation = useMutation({
    mutationFn: async (data: ServerFormData) => {
      const response = await fetch('https://api.theservermonitor.com/server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          server_name: data.server_name,
          description: data.description || ''
        })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create server');
      }
      
      return result;
    },
    onSuccess: (result) => {
      // Invalidate and refetch servers list
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      
      toast({
        title: 'Server Added Successfully',
        description: `${result.data.server_name} has been added to your infrastructure.`,
      });

      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Adding Server',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: ServerFormData) => {
    createServerMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Server</DialogTitle>
          <DialogDescription>
            Add a new server to your monitoring dashboard. The server will be assigned a unique identifier for monitoring.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="server_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Production Web Server, Database Primary, Load Balancer" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the server's purpose, applications, or any important notes..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                What happens next?
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Server will be assigned a unique monitoring identifier</li>
                <li>• You can install monitoring agents using the provided scripts</li>
                <li>• Real-time metrics will appear once agents are connected</li>
                <li>• Configure alerts and notifications for this server</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createServerMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createServerMutation.isPending}
              >
                {createServerMutation.isPending ? 'Adding...' : 'Add Server'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}