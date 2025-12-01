import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface BusinessOnboardingProps {
  open: boolean;
  onBusinessCreated: () => void;
}

export function BusinessOnboarding({ open, onBusinessCreated }: BusinessOnboardingProps) {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: businessName,
          place_id: placeId,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your business has been added!',
      });

      onBusinessCreated();
      setBusinessName('');
      setPlaceId('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create business',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to VoyageRespond</DialogTitle>
          <DialogDescription>
            Let's get started by adding your business information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              placeholder="My Business"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeId">Google Place ID</Label>
            <Input
              id="placeId"
              placeholder="ChIJ..."
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Find your Google Place ID from Google Business Profile
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Business'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
