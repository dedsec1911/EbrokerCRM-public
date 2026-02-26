import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Home, Armchair, IndianRupee, Users, Key, Building2, Phone, CheckCircle, XCircle } from 'lucide-react';
import WhatsAppShare from '@/components/WhatsAppShare';
import Layout from '@/components/Layout';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      toast.error('Failed to load property');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleApprove = async () => {
    try {
      await axios.post(`/properties/${id}/approve`);
      toast.success('Property approved!');
      fetchProperty();
    } catch (error) {
      toast.error('Failed to approve property');
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`/properties/${id}/reject`);
      toast.success('Property rejected');
      fetchProperty();
    } catch (error) {
      toast.error('Failed to reject property');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) return null;

  const statusColors = {
    approved: 'bg-green-500',
    pending: 'bg-orange-500',
    rejected: 'bg-red-500',
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2" data-testid="property-title">
                      {property.bhk} {property.property_type}
                    </h1>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span data-testid="property-location">{property.location}</span>
                    </div>
                  </div>
                  <Badge className={statusColors[property.status]} data-testid="property-status">
                    {property.status}
                  </Badge>
                </div>

                {property.images && property.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-6" data-testid="property-images">
                    {property.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Property ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-semibold">{property.bhk}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Armchair className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Furnishing</p>
                      <p className="font-semibold">{property.furnishing}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rent</p>
                      <p className="font-semibold">₹{property.rent}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Deposit</p>
                      <p className="font-semibold">₹{property.deposit}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Suitable For</p>
                      <p className="font-semibold">{property.tenant_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Possession</p>
                      <p className="font-semibold">{property.possession}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Building</p>
                      <p className="font-semibold">{property.building}</p>
                    </div>
                  </div>
                </div>

                {property.description && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{property.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {user?.role === 'admin' && property.status === 'pending' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Admin Actions</h3>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleApprove}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid="approve-property-btn"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Property
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      className="flex-1"
                      data-testid="reject-property-btn"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Property
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Contact Agent</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Agent Name</p>
                    <p className="font-semibold" data-testid="agent-name">{property.agent_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${property.agent_contact}`} className="font-semibold" data-testid="agent-contact">
                        {property.agent_contact}
                      </a>
                    </div>
                  </div>
                </div>

                <WhatsAppShare propertyId={property.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}