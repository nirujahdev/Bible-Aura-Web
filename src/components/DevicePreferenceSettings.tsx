import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Smartphone, Monitor, RotateCcw } from 'lucide-react';
import { useDevicePreference } from '@/hooks/useDevicePreference';
import { useIsMobile } from '@/hooks/use-mobile';
import { type DeviceType } from '@/lib/devicePreferences';
import { useToast } from '@/hooks/use-toast';

export default function DevicePreferenceSettings() {
  const { preference, updatePreference, clearPreference } = useDevicePreference();
  const isMobileDevice = useIsMobile();
  const { toast } = useToast();

  const handlePreferenceChange = (value: DeviceType) => {
    updatePreference(value);
    toast({
      title: "Preference Updated",
      description: `Your device preference has been set to ${value}.`,
    });
  };

  const handleReset = () => {
    clearPreference();
    toast({
      title: "Preference Reset",
      description: "Your device preference has been cleared. You'll be asked to choose again on your next sign-in.",
    });
  };

  const getRecommendation = () => {
    return isMobileDevice ? 'mobile' : 'desktop';
  };

  const recommendation = getRecommendation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Device Preference
        </CardTitle>
        <CardDescription>
          Choose your preferred experience for Bible Aura. This affects the interface layout and available features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={preference?.type || ''}
          onValueChange={handlePreferenceChange}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="desktop" id="desktop" />
            <Label htmlFor="desktop" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Desktop Experience</div>
                  <div className="text-sm text-gray-600">
                    Full-featured interface with advanced tools
                    {recommendation === 'desktop' && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Recommended for your device
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="mobile" id="mobile" />
            <Label htmlFor="mobile" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Mobile Experience</div>
                  <div className="text-sm text-gray-600">
                    Touch-optimized interface for phones and tablets
                    {recommendation === 'mobile' && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Recommended for your device
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {preference && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Current preference: <span className="font-medium capitalize">{preference.type}</span>
                <div className="text-xs text-gray-500">
                  Set on {new Date(preference.timestamp).toLocaleDateString()}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>Note:</strong> You can change this preference anytime. The interface will adapt to your choice during your next session.
        </div>
      </CardContent>
    </Card>
  );
} 