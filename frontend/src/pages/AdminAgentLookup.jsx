import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, Users, Home, Clock, CheckCircle, Mail, Phone, ArrowLeft } from 'lucide-react';

export default function AdminAgentLookup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentProperties, setAgentProperties] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Unauthorized access');
      return;
    }
    if (user.role !== 'admin') {
      toast.error('Only admins can access this page');
      return;
    }
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/agents');
      setAgents(response.data);
      setFilteredAgents(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredAgents(agents);
    } else {
      const filtered = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(value.toLowerCase()) ||
          agent.email.toLowerCase().includes(value.toLowerCase()) ||
          agent.phone.includes(value)
      );
      setFilteredAgents(filtered);
    }
  };

  const fetchAgentProperties = async (agentId) => {
    try {
      const response = await axios.get(`/admin/agents/${agentId}/properties`);
      setAgentProperties(response.data.properties);
      setSelectedAgent(response.data.agent);
      setShowDetails(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load agent properties');
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Agent Lookup</h1>
            </div>
          </div>
          <p className="text-gray-600 ml-12">View and manage all active agents and their listings</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-200 text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {!showDetails ? (
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Active Agents ({filteredAgents.length})</CardTitle>
              <CardDescription className="text-gray-600">
                Showing {filteredAgents.length} of {agents.length} agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading agents...</div>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <div className="text-gray-500">No agents found</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700">Name</TableHead>
                        <TableHead className="text-gray-700">Email</TableHead>
                        <TableHead className="text-gray-700">Phone</TableHead>
                        <TableHead className="text-gray-700 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Home className="w-4 h-4" />
                            Total
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-700 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" />
                            Pending
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-700 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Approved
                          </div>
                        </TableHead>
                        <TableHead className="text-gray-700">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgents.map((agent) => (
                        <TableRow key={agent.id} className="border-gray-200 hover:bg-gray-50">
                          <TableCell className="text-gray-900 font-medium">{agent.name}</TableCell>
                          <TableCell className="text-gray-700">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              {agent.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              {agent.phone}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                              {agent.total_properties}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                              {agent.pending_properties}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                              {agent.approved_properties}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => fetchAgentProperties(agent.id)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div>
            <Card className="bg-white border-gray-200 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">{selectedAgent?.name}</CardTitle>
                  <Button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedAgent(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    ← Back
                  </Button>
                </div>
                <CardDescription className="text-gray-600">Agent Details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-600 text-sm">Email</label>
                    <p className="text-gray-900">{selectedAgent?.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Phone</label>
                    <p className="text-gray-900">{selectedAgent?.phone}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Total Listings</label>
                    <p className="text-gray-900 font-semibold">{agentProperties.length}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Joined</label>
                    <p className="text-gray-900">
                      {new Date(selectedAgent?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Properties ({agentProperties.length})</CardTitle>
                <CardDescription className="text-gray-600">
                  All listings by this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agentProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <div className="text-gray-500">No properties listed</div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {agentProperties.map((property) => (
                      <div
                        key={property.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-gray-900 font-semibold">{property.property_type}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              property.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {property.status}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{property.location}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">BHK:</span>
                            <span className="text-gray-900 ml-1">{property.bhk}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rent:</span>
                            <span className="text-gray-900 ml-1">₹{property.rent}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Building:</span>
                            <span className="text-gray-900 ml-1">{property.building}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
