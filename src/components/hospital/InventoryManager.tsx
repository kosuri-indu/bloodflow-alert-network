import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, Plus, Droplets, Calendar, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mockDatabaseService, { BloodInventory } from '@/services/mockDatabase';
import { format } from 'date-fns';

interface InventoryManagerProps {
  hospitalName: string;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ hospitalName }) => {
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<BloodInventory | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bloodType: '',
    rhFactor: 'positive' as 'positive' | 'negative',
    units: 0,
    processedDate: '',
    expirationDate: '',
    donorAge: 0,
    specialAttributes: [] as string[]
  });

  const specialAttributeOptions = [
    'irradiated', 'leukoreduced', 'cmv-negative', 'frozen', 'washed', 
    'pathogen-reduced', 'apheresis', 'autologous', 'directed-donor'
  ];

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const data = await mockDatabaseService.getBloodInventoryDetails();
      const hospitalInventory = data.filter(item => item.hospital === hospitalName);
      setInventory(hospitalInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [hospitalName]);

  const resetForm = () => {
    setFormData({
      bloodType: '',
      rhFactor: 'positive',
      units: 0,
      processedDate: '',
      expirationDate: '',
      donorAge: 0,
      specialAttributes: []
    });
  };

  const handleAdd = async () => {
    try {
      if (!formData.bloodType || !formData.processedDate || !formData.expirationDate || formData.units <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields with valid values.",
          variant: "destructive",
        });
        return;
      }

      await mockDatabaseService.addBloodInventory(hospitalName, {
        bloodType: formData.bloodType,
        rhFactor: formData.rhFactor,
        units: formData.units,
        processedDate: new Date(formData.processedDate),
        expirationDate: new Date(formData.expirationDate),
        donorAge: formData.donorAge,
        specialAttributes: formData.specialAttributes
      });

      toast({
        title: "Success",
        description: "Blood inventory added successfully.",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      console.error('Error adding inventory:', error);
      toast({
        title: "Error",
        description: "Failed to add blood inventory.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    try {
      if (!editingItem) return;

      const result = await mockDatabaseService.updateBloodInventory(editingItem.id, {
        bloodType: formData.bloodType,
        rhFactor: formData.rhFactor,
        units: formData.units,
        processedDate: new Date(formData.processedDate),
        expirationDate: new Date(formData.expirationDate),
        donorAge: formData.donorAge,
        specialAttributes: formData.specialAttributes
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Blood inventory updated successfully.",
        });
        setIsEditDialogOpen(false);
        setEditingItem(null);
        resetForm();
        fetchInventory();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update inventory.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update blood inventory.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (inventoryId: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      const result = await mockDatabaseService.deleteBloodInventory(inventoryId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Blood inventory deleted successfully.",
        });
        fetchInventory();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete inventory.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast({
        title: "Error",
        description: "Failed to delete blood inventory.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: BloodInventory) => {
    setEditingItem(item);
    setFormData({
      bloodType: item.bloodType,
      rhFactor: item.rhFactor,
      units: item.units,
      processedDate: format(new Date(item.processedDate), 'yyyy-MM-dd'),
      expirationDate: format(new Date(item.expirationDate), 'yyyy-MM-dd'),
      donorAge: item.donorAge,
      specialAttributes: item.specialAttributes || []
    });
    setIsEditDialogOpen(true);
  };

  const handleSpecialAttributeChange = (attribute: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialAttributes: checked
        ? [...prev.specialAttributes, attribute]
        : prev.specialAttributes.filter(attr => attr !== attribute)
    }));
  };

  const isExpiringSoon = (expirationDate: Date) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };

  const isExpired = (expirationDate: Date) => {
    return new Date(expirationDate) < new Date();
  };

  // Filter inventory based on search and blood type
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.bloodType.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         item.specialAttributes?.some(attr => attr.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesBloodType = bloodTypeFilter === 'all' || 
                           `${item.bloodType}${item.rhFactor === 'positive' ? '+' : '-'}` === bloodTypeFilter;
    return matchesSearch && matchesBloodType;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-indian-blue" />
            Blood Inventory Management
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-indian-blue hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Blood Unit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Blood Inventory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={formData.bloodType} onValueChange={(value) => setFormData({...formData, bloodType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rhFactor">Rh Factor</Label>
                  <Select value={formData.rhFactor} onValueChange={(value: any) => setFormData({...formData, rhFactor: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive (+)</SelectItem>
                      <SelectItem value="negative">Negative (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="units">Units</Label>
                  <Input
                    type="number"
                    value={formData.units}
                    onChange={(e) => setFormData({...formData, units: parseInt(e.target.value) || 0})}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="processedDate">Processed Date</Label>
                  <Input
                    type="date"
                    value={formData.processedDate}
                    onChange={(e) => setFormData({...formData, processedDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="donorAge">Donor Age</Label>
                  <Input
                    type="number"
                    value={formData.donorAge}
                    onChange={(e) => setFormData({...formData, donorAge: parseInt(e.target.value) || 0})}
                    min="18"
                    max="70"
                  />
                </div>
                <div>
                  <Label>Special Attributes</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {specialAttributeOptions.map((attribute) => (
                      <div key={attribute} className="flex items-center space-x-2">
                        <Checkbox
                          id={attribute}
                          checked={formData.specialAttributes.includes(attribute)}
                          onCheckedChange={(checked) => handleSpecialAttributeChange(attribute, checked as boolean)}
                        />
                        <Label htmlFor={attribute} className="text-sm capitalize">
                          {attribute.replace('-', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} className="bg-indian-blue hover:bg-blue-700">
                    Add Inventory
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by blood type or attributes..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading inventory...</div>
        ) : filteredInventory.length > 0 ? (
          <div className="space-y-4">
            {filteredInventory.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="font-semibold text-lg text-indian-blue">
                      {item.bloodType} {item.rhFactor === 'positive' ? '+' : '-'}
                    </div>
                    <Badge variant="outline" className="bg-indian-blue text-white">
                      {item.units} units
                    </Badge>
                    {isExpired(item.expirationDate) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                    {!isExpired(item.expirationDate) && isExpiringSoon(item.expirationDate) && (
                      <Badge className="bg-amber-500">Expiring Soon</Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      <span className="font-medium">Processed:</span> {format(new Date(item.processedDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-gray-600">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      <span className="font-medium">Expires:</span> {format(new Date(item.expirationDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <User className="h-4 w-4 inline mr-1" />
                      <span className="font-medium">Donor Age:</span> {item.donorAge} years
                    </p>
                    {item.specialAttributes && item.specialAttributes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Special Attributes:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.specialAttributes.map((attr) => (
                            <Badge key={attr} variant="outline" className="text-xs">
                              {attr.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-600">
            <Droplets className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">No blood inventory found</p>
            <p className="text-sm text-gray-500">
              {searchFilter || bloodTypeFilter !== 'all' 
                ? 'Try adjusting your filters or search terms.'
                : 'Add blood units to get started.'}
            </p>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Blood Inventory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select value={formData.bloodType} onValueChange={(value) => setFormData({...formData, bloodType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="O">O</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rhFactor">Rh Factor</Label>
                <Select value={formData.rhFactor} onValueChange={(value: any) => setFormData({...formData, rhFactor: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive (+)</SelectItem>
                    <SelectItem value="negative">Negative (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="units">Units</Label>
                <Input
                  type="number"
                  value={formData.units}
                  onChange={(e) => setFormData({...formData, units: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="processedDate">Processed Date</Label>
                <Input
                  type="date"
                  value={formData.processedDate}
                  onChange={(e) => setFormData({...formData, processedDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="donorAge">Donor Age</Label>
                <Input
                  type="number"
                  value={formData.donorAge}
                  onChange={(e) => setFormData({...formData, donorAge: parseInt(e.target.value) || 0})}
                  min="18"
                  max="70"
                />
              </div>
              <div>
                <Label>Special Attributes</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {specialAttributeOptions.map((attribute) => (
                    <div key={attribute} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${attribute}`}
                        checked={formData.specialAttributes.includes(attribute)}
                        onCheckedChange={(checked) => handleSpecialAttributeChange(attribute, checked as boolean)}
                      />
                      <Label htmlFor={`edit-${attribute}`} className="text-sm capitalize">
                        {attribute.replace('-', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit} className="bg-indian-blue hover:bg-blue-700">
                  Update Inventory
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InventoryManager;
