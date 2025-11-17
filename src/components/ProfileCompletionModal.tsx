import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Sparkles, AlertCircle } from 'lucide-react';

interface ProfileCompletionModalProps {
  open: boolean;
  onComplete: () => void;
}

export function ProfileCompletionModal({ open, onComplete }: ProfileCompletionModalProps) {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    age: '',
    denomination: '',
    agreedToTerms: false,
    agreedToPrivacy: false,
    isOver13: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form with existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.display_name || '',
        phoneNumber: profile.phone_number || '',
        age: profile.age?.toString() || '',
        denomination: profile.denomination || '',
        agreedToTerms: profile.agreed_to_terms || false,
        agreedToPrivacy: profile.agreed_to_privacy || false,
        isOver13: profile.is_over_13 || false,
      });
    } else if (user) {
      // Use email username as default display name
      setFormData(prev => ({
        ...prev,
        displayName: user.email?.split('@')[0] || '',
      }));
    }
  }, [profile, user]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms of service';
    }

    if (!formData.agreedToPrivacy) {
      newErrors.agreedToPrivacy = 'You must agree to the privacy policy';
    }

    if (!formData.isOver13) {
      newErrors.isOver13 = 'You must confirm you are over 13 years old';
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120)) {
      newErrors.age = 'Please enter a valid age';
    }

    if (formData.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        display_name: formData.displayName.trim() || null,
        phone_number: formData.phoneNumber.trim() || null,
        age: formData.age ? parseInt(formData.age) : null,
        denomination: formData.denomination.trim() || null,
        agreed_to_terms: formData.agreedToTerms,
        agreed_to_privacy: formData.agreedToPrivacy,
        is_over_13: formData.isOver13,
        updated_at: new Date().toISOString(),
      };

      // Use updateProfile from auth context - it handles both insert and update efficiently
      // This is faster than doing separate queries
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<{ error: Error }>((resolve) => 
        setTimeout(() => resolve({ error: new Error('Request is taking too long. Please check your internet connection.') }), 15000)
      );
      
      const result = await Promise.race([
        updateProfile(updateData),
        timeoutPromise
      ]);
      
      if (result.error) {
        console.error('Profile update error:', result.error);
        throw result.error;
      }
      
      console.log('✅ Profile data saved successfully:', {
        user_id: user.id,
        ...updateData
      });

      toast({
        title: "Profile completed!",
        description: "Your profile has been saved successfully.",
      });

      // Call onComplete immediately - no delay needed
      onComplete();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const denominations = [
    'Baptist',
    'Methodist',
    'Presbyterian',
    'Lutheran',
    'Anglican',
    'Catholic',
    'Orthodox',
    'Pentecostal',
    'Non-denominational',
    'Other',
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-[90vw] md:w-full mx-auto p-3 sm:p-4 md:p-6" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold truncate">Complete Your Profile</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">
                Help us personalize your Bible Aura experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 sm:mt-4">
          {/* Two column layout for laptop, single column for mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              {/* Display Name */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="displayName" className="text-xs sm:text-sm font-medium">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Enter your display name"
                  className={`h-9 sm:h-10 text-sm sm:text-base ${errors.displayName ? 'border-red-500' : ''}`}
                />
                {errors.displayName && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phoneNumber" className="text-xs sm:text-sm font-medium">
                  Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className={`h-9 sm:h-10 text-sm sm:text-base ${errors.phoneNumber ? 'border-red-500' : ''}`}
                />
                {errors.phoneNumber && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="age" className="text-xs sm:text-sm font-medium">
                  Age <span className="text-gray-500 text-xs">(Optional)</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter your age"
                  className={`h-9 sm:h-10 text-sm sm:text-base ${errors.age ? 'border-red-500' : ''}`}
                />
                {errors.age && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {errors.age}
                  </p>
                )}
              </div>

              {/* Denomination */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="denomination" className="text-xs sm:text-sm font-medium">
                  Denomination <span className="text-gray-500 text-xs">(Optional)</span>
                </Label>
                <Select
                  value={formData.denomination}
                  onValueChange={(value) => setFormData({ ...formData, denomination: value })}
                >
                  <SelectTrigger id="denomination" className="h-9 sm:h-10 text-sm sm:text-base">
                    <SelectValue placeholder="Select your denomination" />
                  </SelectTrigger>
                  <SelectContent>
                    {denominations.map((denom) => (
                      <SelectItem key={denom} value={denom} className="text-sm">
                        {denom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column - Required Agreements */}
            <div className="space-y-3 sm:space-y-4 md:space-y-5">

              {/* Terms and Agreements */}
              <div className="space-y-2.5 sm:space-y-3 md:space-y-4 p-2.5 sm:p-3 md:p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                  Required Agreements
                </h3>

                {/* Terms of Service */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, agreedToTerms: checked as boolean })
                    }
                    className={`mt-0.5 sm:mt-1 flex-shrink-0 ${errors.agreedToTerms ? 'border-red-500' : ''}`}
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor="terms"
                      className="text-xs sm:text-sm font-normal cursor-pointer flex flex-wrap items-start gap-1 leading-relaxed"
                    >
                      <span>I agree to the</span>
                      <a
                        href="/terms-of-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium break-words"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </a>
                      <span className="text-red-500">*</span>
                    </Label>
                    {errors.agreedToTerms && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {errors.agreedToTerms}
                      </p>
                    )}
                  </div>
                </div>

                {/* Privacy Policy */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <Checkbox
                    id="privacy"
                    checked={formData.agreedToPrivacy}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, agreedToPrivacy: checked as boolean })
                    }
                    className={`mt-0.5 sm:mt-1 flex-shrink-0 ${errors.agreedToPrivacy ? 'border-red-500' : ''}`}
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor="privacy"
                      className="text-xs sm:text-sm font-normal cursor-pointer flex flex-wrap items-start gap-1 leading-relaxed"
                    >
                      <span>I agree to the</span>
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium break-words"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </a>
                      <span className="text-red-500">*</span>
                    </Label>
                    {errors.agreedToPrivacy && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {errors.agreedToPrivacy}
                      </p>
                    )}
                  </div>
                </div>

                {/* Age Confirmation */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <Checkbox
                    id="ageConfirm"
                    checked={formData.isOver13}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isOver13: checked as boolean })
                    }
                    className={`mt-0.5 sm:mt-1 flex-shrink-0 ${errors.isOver13 ? 'border-red-500' : ''}`}
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor="ageConfirm"
                      className="text-xs sm:text-sm font-normal cursor-pointer leading-relaxed"
                    >
                      I confirm that I am over <span className="text-primary font-medium">13 years old</span> <span className="text-red-500">*</span>
                    </Label>
                    {errors.isOver13 && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        {errors.isOver13}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t mt-3 sm:mt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-w-[140px] h-10 sm:h-11 text-sm sm:text-base font-medium"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

