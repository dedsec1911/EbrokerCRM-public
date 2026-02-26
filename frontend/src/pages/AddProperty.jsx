import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Layout from '@/components/Layout';

export default function AddProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    property_type: 'Apartment',
    bhk: '1BHK',
    furnishing: 'Unfurnished',
    rent: '',
    deposit: '',
    tenant_type: 'Family',
    possession: 'Ready to move',
    building: '',
    location: '',
    agent_name: '',
    agent_contact: '',
    description: '',
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 500000;

    files.forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 500KB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/properties', {
        ...formData,
        images: images,
      });
      toast.success('Property added successfully! Awaiting admin approval.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="add-property-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_type">Property Type</Label>
                  <select
                    id="property_type"
                    data-testid="property-type-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  >
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Independent House</option>
                    <option>Shop</option>
                    <option>Office Space</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="bhk">BHK</Label>
                  <select
                    id="bhk"
                    data-testid="bhk-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.bhk}
                    onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                  >
                    <option>1BHK</option>
                    <option>2BHK</option>
                    <option>3BHK</option>
                    <option>4BHK</option>
                    <option>5BHK+</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="furnishing">Furnishing</Label>
                  <select
                    id="furnishing"
                    data-testid="furnishing-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.furnishing}
                    onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                  >
                    <option>Unfurnished</option>
                    <option>Semi-Furnished</option>
                    <option>Fully-Furnished</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="tenant_type">Suitable For</Label>
                  <select
                    id="tenant_type"
                    data-testid="tenant-type-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.tenant_type}
                    onChange={(e) => setFormData({ ...formData, tenant_type: e.target.value })}
                  >
                    <option>Family</option>
                    <option>Bachelor</option>
                    <option>Family or Bachelor</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="rent">Rent (₹)</Label>
                  <Input
                    id="rent"
                    data-testid="rent-input"
                    type="text"
                    placeholder="e.g., 30000"
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deposit">Deposit (₹)</Label>
                  <Input
                    id="deposit"
                    data-testid="deposit-input"
                    type="text"
                    placeholder="e.g., 100000"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="possession">Possession</Label>
                  <select
                    id="possession"
                    data-testid="possession-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.possession}
                    onChange={(e) => setFormData({ ...formData, possession: e.target.value })}
                  >
                    <option>Ready to move</option>
                    <option>Within 15 days</option>
                    <option>Within 1 month</option>
                    <option>Within 3 months</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="building">Building Name</Label>
                  <Input
                    id="building"
                    data-testid="building-input"
                    type="text"
                    placeholder="e.g., Haridwar"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  data-testid="location-input"
                  type="text"
                  placeholder="e.g., Chincholi Bunder, Malad West"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  data-testid="description-input"
                  placeholder="Additional details about the property"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent_name">Agent Name</Label>
                  <Input
                    id="agent_name"
                    data-testid="agent-name-input"
                    type="text"
                    placeholder="e.g., Rakesh"
                    value={formData.agent_name}
                    onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="agent_contact">Agent Contact</Label>
                  <Input
                    id="agent_contact"
                    data-testid="agent-contact-input"
                    type="tel"
                    placeholder="e.g., 9999999999"
                    value={formData.agent_contact}
                    onChange={(e) => setFormData({ ...formData, agent_contact: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Property Images</Label>
                <div className="mt-2">
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/10 transition-colors"
                    data-testid="image-upload-label"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload images (max 500KB each)</p>
                    </div>
                    <input
                      id="image-upload"
                      data-testid="image-upload-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4" data-testid="images-preview">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`remove-image-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-vibrant hover:bg-vibrant/90"
                disabled={loading}
                data-testid="submit-property-btn"
              >
                {loading ? 'Adding Property...' : 'Add Property'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}