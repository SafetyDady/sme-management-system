import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { 
  Users, 
  UserPlus, 
  Building, 
  FileText, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Shield,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'sonner';
import { employeeService } from '../../../services/employeeService';

// Mock data สำหรับทดสอบ (จะถูกแทนที่ด้วย API data)
const mockEmployees = [];

// Department และ Employment Type options
const departments = {
  engineering: 'วิศวกรรม',
  hr: 'ทรัพยากรบุคคล', 
  sales: 'ฝ่ายขาย',
  marketing: 'การตลาด',
  accounting: 'บัญชี',
  purchasing: 'จัดซื้อ'
};

const employmentTypes = {
  full_time: 'พนักงานประจำ',
  part_time: 'พนักงานชั่วคราว',
  contract: 'พนักงานสัญญาจ้าง',
  internship: 'นักศึกษาฝึกงาน'
};

// Permission check function (simplified)
const canManageEmployees = (role) => {
  return ['superadmin', 'admin', 'hr', 'manager'].includes(role);
};

const EmployeeManagement = () => {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    emp_code: '',
    first_name: '',
    last_name: '',
    department: '',
    position: '',
    employment_type: 'full_time',
    start_date: '',
    salary_monthly: '',
    wage_daily: '',
    contact_phone: '',
    contact_address: '',
    note: '',
    active_status: true
  });

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // Load employees from API
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError(err.message);
      toast.error('ไม่สามารถโหลดข้อมูลพนักงานได้: ' + err.message);
      setEmployees(mockEmployees); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  // Check permission
  if (!currentUser || !canManageEmployees(currentUser.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access employee management. This feature requires HR or higher access level.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = searchTerm === '' || 
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.emp_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && emp.active_status) ||
      (statusFilter === 'inactive' && !emp.active_status);

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Modal handlers
  const openAddModal = () => {
    setFormData({
      emp_code: '',
      first_name: '',
      last_name: '',
      department: '',
      position: '',
      employment_type: 'full_time',
      start_date: '',
      salary_monthly: '',
      wage_daily: '',
      contact_phone: '',
      contact_address: '',
      note: '',
      active_status: true
    });
    setShowAddModal(true);
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setFormData({ ...employee });
    setShowEditModal(true);
  };

  const openViewModal = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedEmployee(null);
  };

  // CRUD operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const employeeData = {
        ...formData,
        salary_monthly: formData.salary_monthly ? Number(formData.salary_monthly) : null,
        wage_daily: formData.wage_daily ? Number(formData.wage_daily) : null,
      };

      if (showAddModal) {
        // Add new employee
        const newEmployee = await employeeService.createEmployee(employeeData);
        setEmployees([...employees, newEmployee]);
        toast.success('เพิ่มพนักงานใหม่สำเร็จ!');
      } else if (showEditModal) {
        // Update employee
        const updatedEmployee = await employeeService.updateEmployee(selectedEmployee.employee_id, employeeData);
        setEmployees(employees.map(emp => 
          emp.employee_id === selectedEmployee.employee_id ? updatedEmployee : emp
        ));
        toast.success('อัพเดตข้อมูลพนักงานสำเร็จ!');
      }
      
      closeModals();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (employee) => {
    if (window.confirm(`ต้องการลบพนักงาน ${employee.first_name} ${employee.last_name} ใช่หรือไม่?`)) {
      try {
        await employeeService.deleteEmployee(employee.employee_id);
        setEmployees(employees.filter(emp => emp.employee_id !== employee.employee_id));
        toast.success('ลบข้อมูลพนักงานสำเร็จ!');
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('เกิดข้อผิดพลาดในการลบพนักงาน: ' + error.message);
      }
    }
  };

  const toggleStatus = async (employee) => {
    try {
      const updatedEmployee = await employeeService.updateEmployee(employee.employee_id, {
        active_status: !employee.active_status
      });
      setEmployees(employees.map(emp => 
        emp.employee_id === employee.employee_id ? updatedEmployee : emp
      ));
      toast.success(`${employee.active_status ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}พนักงานสำเร็จ!`);
    } catch (error) {
      console.error('Error toggling employee status:', error);
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          👥 Employee Management System
        </h1>
        <p className="text-green-100">
          จัดการข้อมูลพนักงาน | User: {currentUser?.username || 'Unknown'} | Role: {currentUser?.role || 'hr'}
        </p>
        <p className="text-green-200 text-sm mt-1">
          Add, Edit, View, and Manage Employee Records
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error} - กำลังใช้ข้อมูลทดสอบ
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">กำลังโหลดข้อมูลพนักงาน...</span>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Employees</p>
                    <p className="text-2xl font-bold">{employees.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active</p>
                <p className="text-2xl font-bold">{employees.filter(emp => emp.active_status).length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Departments</p>
                <p className="text-2xl font-bold">{Object.keys(departments).length}</p>
              </div>
              <Building className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">This Month</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <FileText className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Employee List ({filteredEmployees.length})
            </CardTitle>
            <Button onClick={openAddModal} className="bg-green-600 hover:bg-green-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาชื่อ นามสกุล หรือรหัสพนักงาน"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ทุกแผนก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกแผนก</SelectItem>
                {Object.entries(departments).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ทุกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="active">ใช้งาน</SelectItem>
                <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Employee Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">รหัสพนักงาน</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">แผนก</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ตำแหน่ง</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">เริ่มงาน</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">สถานะ</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.employee_id || employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {employee.emp_code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {departments[employee.department] || employee.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {employee.position}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {employee.start_date ? new Date(employee.start_date).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={employee.active_status ? "default" : "secondary"}>
                          {employee.active_status ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openViewModal(employee)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditModal(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(employee)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ไม่พบข้อมูลพนักงาน</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {showAddModal ? 'เพิ่มพนักงานใหม่' : 'แก้ไขข้อมูลพนักงาน'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>รหัสพนักงาน</Label>
                  <Input
                    value={formData.emp_code}
                    onChange={(e) => setFormData({...formData, emp_code: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>ชื่อ</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>นามสกุล</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>แผนก</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(departments).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ตำแหน่ง</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>ประเภทการจ้าง</Label>
                  <Select value={formData.employment_type} onValueChange={(value) => setFormData({...formData, employment_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(employmentTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>วันที่เริ่มงาน</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>เงินเดือน (บาท/เดือน)</Label>
                  <Input
                    type="number"
                    value={formData.salary_monthly}
                    onChange={(e) => setFormData({...formData, salary_monthly: e.target.value})}
                  />
                </div>
                <div>
                  <Label>เบอร์โทรศัพท์</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>ที่อยู่</Label>
                <Input
                  value={formData.contact_address}
                  onChange={(e) => setFormData({...formData, contact_address: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={closeModals}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">
                  {submitting ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> กำลังบันทึก...</> : 'บันทึก'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">ข้อมูลพนักงาน</h2>
              <Button variant="ghost" onClick={closeModals}>×</Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">รหัสพนักงาน</p>
                    <p className="font-medium">{selectedEmployee.emp_code}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ชื่อ-นามสกุล</p>
                    <p className="font-medium">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Building className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">แผนก</p>
                    <p className="font-medium">{departments[selectedEmployee.department]}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ตำแหน่ง</p>
                    <p className="font-medium">{selectedEmployee.position}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">วันที่เริ่มงาน</p>
                    <p className="font-medium">{selectedEmployee.start_date}</p>
                  </div>
                </div>
                
                {selectedEmployee.salary_monthly && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">เงินเดือน</p>
                      <p className="font-medium">{Number(selectedEmployee.salary_monthly).toLocaleString()} บาท/เดือน</p>
                    </div>
                  </div>
                )}
                
                {selectedEmployee.contact_phone && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">เบอร์โทรศัพท์</p>
                      <p className="font-medium">{selectedEmployee.contact_phone}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedEmployee.contact_address && (
                <div className="flex items-start space-x-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ที่อยู่</p>
                    <p className="font-medium">{selectedEmployee.contact_address}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 pt-4 border-t">
                <Badge variant={selectedEmployee.active_status ? "default" : "secondary"}>
                  {selectedEmployee.active_status ? '🟢 ใช้งาน' : '🔴 ไม่ใช้งาน'}
                </Badge>
                <span className="text-sm text-gray-500">
                  ประเภท: {employmentTypes[selectedEmployee.employment_type]}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
              <Button variant="outline" onClick={closeModals}>
                ปิด
              </Button>
              <Button onClick={() => { closeModals(); openEditModal(selectedEmployee); }}>
                แก้ไข
              </Button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default EmployeeManagement;
