
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export const LocationSelector = ({ selectedLocation, onLocationChange }: LocationSelectorProps) => {
  const locations = [
    { value: 'kuopio', label: 'Kuopio' },
    { value: 'iisalmi', label: 'Iisalmi' },
    { value: 'varkaus', label: 'Varkaus' },
    { value: 'all', label: 'Kaikki toimipisteet' }
  ];

  return (
    <Select value={selectedLocation} onValueChange={onLocationChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Valitse toimipiste" />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem key={location.value} value={location.value}>
            {location.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
