
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const serverFormSchema = z.object({
  name: z.string().min(1, 'Server name is required'),
  ip: z.string().ip('Please enter a valid IP address'),
  os: z.string().min(1, 'Operating system is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
});

type ServerFormData = z.infer<typeof serverFormSchema>;

interface AddServerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServerAdded: (server: any) => void;
}

export function AddServerForm({ open, onOpenChange, onServerAdded }: AddServerFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ServerFormData>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: '',
      ip: '',
      os: '',
      location: '',
      description: '',
    },
  });

  const onSubmit = (data: ServerFormData) => {
    // Mock server creation with random values for demo
    const newServer = {
      id: Date.now(),
      name: data.name,
      ip: data.ip,
      status: 'online' as const,
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
      uptime: '0 days, 0h',
      os: data.os,
      location: data.location,
      description: data.description,
    };

    onServerAdded(newServer);
    
    toast({
      title: 'Server Added',
      description: `${data.name} has been successfully added to your infrastructure.`,
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Server</DialogTitle>
          <DialogDescription>
            Add a new server to your infrastructure monitoring dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Web Server 01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 192.168.1.10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="os"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating System</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select OS" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ubuntu 22.04">Ubuntu 22.04</SelectItem>
                      <SelectItem value="Ubuntu 20.04">Ubuntu 20.04</SelectItem>
                      <SelectItem value="CentOS 8">CentOS 8</SelectItem>
                      <SelectItem value="RHEL 9">RHEL 9</SelectItem>
                      <SelectItem value="Debian 11">Debian 11</SelectItem>
                      <SelectItem value="Windows Server 2022">Windows Server 2022</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="US-East-1">US-East-1</SelectItem>
                      <SelectItem value="US-West-1">US-West-1</SelectItem>
                      <SelectItem value="US-West-2">US-West-2</SelectItem>
                      <SelectItem value="EU-Central-1">EU-Central-1</SelectItem>
                      <SelectItem value="EU-West-1">EU-West-1</SelectItem>
                      <SelectItem value="AP-Southeast-1">AP-Southeast-1</SelectItem>
                      <SelectItem value="AP-Northeast-1">AP-Northeast-1</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Brief description of the server's purpose..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Server
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
