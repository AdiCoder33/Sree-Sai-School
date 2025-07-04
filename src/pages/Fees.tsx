import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Clock, Search, Send, Plus } from 'lucide-react';
import { RoleGuard } from '../components/RoleGuard';
import { TargetedFeeRequestModal } from '../components/TargetedFeeRequestModal';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const mockFeeRecords = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Emma Johnson',
    class: 'Grade 5A',
    monthYear: 'January 2024',
    amount: 500,
    dueDate: '2024-01-31',
    paidDate: '2024-01-15',
    status: 'paid' as const,
    paymentMethod: 'Online'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Liam Smith',
    class: 'Grade 6B',
    monthYear: 'January 2024',
    amount: 500,
    dueDate: '2024-01-31',
    paidDate: null,
    status: 'pending' as const,
    paymentMethod: null
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Sophia Brown',
    class: 'Grade 4A',
    monthYear: 'January 2024',
    amount: 450,
    dueDate: '2024-01-31',
    paidDate: null,
    status: 'overdue' as const,
    paymentMethod: null
  }
];

export const Fees: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [feeRecords, setFeeRecords] = useState(mockFeeRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    studentName: '',
    class: '',
    monthYear: '',
    amount: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [isCreateFeeOpen, setIsCreateFeeOpen] = useState(false);

  const filteredRecords = feeRecords.filter(record =>
    record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.monthYear.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFeeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFeeRecord = {
      id: Date.now().toString(),
      studentId: Date.now().toString(),
      studentName: requestFormData.studentName,
      class: requestFormData.class,
      monthYear: requestFormData.monthYear,
      amount: parseInt(requestFormData.amount),
      dueDate: requestFormData.dueDate,
      paidDate: null,
      status: 'pending' as const,
      paymentMethod: null
    };

    setFeeRecords(prev => [newFeeRecord, ...prev]);

    // Send notification to parents
    addNotification({
      type: 'fee_request',
      title: `Fee Payment Request - ${requestFormData.monthYear}`,
      message: `Fee payment of $${requestFormData.amount} is due for ${requestFormData.studentName} (${requestFormData.class}) by ${new Date(requestFormData.dueDate).toLocaleDateString()}`,
      priority: requestFormData.priority,
      targetRole: 'parent'
    });

    toast.success('Fee request sent to parents');
    setIsRequestDialogOpen(false);
    setRequestFormData({
      studentName: '',
      class: '',
      monthYear: '',
      amount: '',
      dueDate: '',
      priority: 'medium'
    });
  };

  const handleTargetedFeeRequest = (studentIds: string[], feeData: any) => {
    // Create fee records for selected students
    const newFeeRecords = studentIds.map(studentId => ({
      id: Date.now().toString() + studentId,
      studentId,
      studentName: `Student ${studentId}`, // This would come from actual student data
      class: 'Various',
      monthYear: feeData.monthYear,
      amount: parseInt(feeData.amount),
      dueDate: feeData.dueDate,
      paidDate: null,
      status: 'pending' as const,
      paymentMethod: null
    }));

    setFeeRecords(prev => [...newFeeRecords, ...prev]);

    // Send notification to parents
    addNotification({
      type: 'fee_request',
      title: `Targeted Fee Payment Request - ${feeData.monthYear}`,
      message: `Fee payment of ₹${feeData.amount} is due by ${new Date(feeData.dueDate).toLocaleDateString()}. ${feeData.description || ''}`,
      priority: feeData.priority,
      targetRole: 'parent'
    });
  };

  const handlePayFee = async (feeId: string) => {
    const feeRecord = feeRecords.find(r => r.id === feeId);
    if (!feeRecord) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/fees/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feeId,
          amount: feeRecord.amount,
          currency: 'INR'
        })
      });

      if (response.ok) {
        const { razorpayOrderId, amount } = await response.json();
        
        // Initialize Razorpay
        const options = {
          key: 'rzp_test_your_key_here', // This should come from backend
          amount: amount,
          currency: 'INR',
          name: 'Sree Sai English Medium High School',
          description: `Fee Payment - ${feeRecord.monthYear}`,
          order_id: razorpayOrderId,
          handler: function (response: any) {
            // Payment successful
            setFeeRecords(prev => prev.map(record => 
              record.id === feeId 
                ? { ...record, status: 'paid' as const, paidDate: new Date().toISOString(), paymentMethod: 'Razorpay' }
                : record
            ));
            toast.success('Payment successful!');
          },
          prefill: {
            name: user?.firstName + ' ' + user?.lastName,
            email: user?.email,
            contact: user?.phone
          },
          theme: {
            color: '#4F46E5'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Error initiating payment');
    }
  };

  const getStatusIcon = (status: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
    }
  };

  const totalAmount = feeRecords.reduce((sum, record) => sum + record.amount, 0);
  const paidAmount = feeRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = feeRecords.filter(r => r.status !== 'paid').reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-6">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage school fees and payments
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <RoleGuard allowedRoles={['principal']}>
            <Button onClick={() => setIsCreateFeeOpen(true)} className="w-full sm:w-auto">
              <CreditCard className="mr-2 h-4 w-4" />
              Create Fee
            </Button>
          </RoleGuard>
          
          <RoleGuard allowedRoles={['principal']}>
            <TargetedFeeRequestModal onSendRequest={handleTargetedFeeRequest} />
          </RoleGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">${totalAmount}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-2xl font-bold text-green-600">${paidAmount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-red-600">${pendingAmount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>View and manage student fee payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by student name, class, or month..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>{record.class}</TableCell>
                  <TableCell>{record.monthYear}</TableCell>
                  <TableCell>₹{record.amount}</TableCell>
                  <TableCell>{new Date(record.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {record.status !== 'paid' && (
                        <RoleGuard allowedRoles={['parent']}>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handlePayFee(record.id)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
                        </RoleGuard>
                      )}
                      {record.status === 'paid' && (
                        <Badge variant="outline" className="text-green-600">
                          Paid on {record.paidDate ? new Date(record.paidDate).toLocaleDateString() : ''}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
