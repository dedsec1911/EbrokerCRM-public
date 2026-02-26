import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Home, IndianRupee } from 'lucide-react';

export default function PropertyCard({ property, onRefresh }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const statusColors = {
    approved: 'bg-green-500',
    pending: 'bg-orange-500',
    rejected: 'bg-red-500',
  };

  const placeholderImage = 'https://images.pexels.com/photos/18435276/pexels-photo-18435276.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

  return (
    <Card
      className="hover-lift cursor-pointer overflow-hidden"
      onClick={() => navigate(`/property/${property.id}`)}
      data-testid={`property-card-${property.id}`}
    >
      <div className="relative">
        <img
          src={property.images?.[0] || placeholderImage}
          alt={`${property.bhk} ${property.property_type}`}
          className="w-full h-48 object-cover"
        />
        <Badge
          className={`absolute top-3 right-3 ${statusColors[property.status]}`}
          data-testid={`property-status-${property.id}`}
        >
          {property.status}
        </Badge>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md">
          <p className="text-lg font-bold text-primary" data-testid={`property-rent-${property.id}`}>₹{property.rent}/mo</p>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2" data-testid={`property-title-${property.id}`}>
          {property.bhk} {property.property_type}
        </h3>

        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate" data-testid={`property-location-${property.id}`}>{property.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Home className="w-3 h-3" />
            <span>{property.furnishing}</span>
          </div>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-3 h-3" />
            <span>Deposit: ₹{property.deposit}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          <p>Agent: {property.agent_name}</p>
        </div>
      </CardContent>
    </Card>
  );
}