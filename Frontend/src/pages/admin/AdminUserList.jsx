import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Phone,
  MapPin,
  Building,
  Calendar,
  Eye,
  Edit,
  Check,
  Ban,
  XCircle,
  X,
  Save,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import {
  adminUserService,
  USER_STATUSES,
  STATUS_STYLES,
} from '../../data/mockAdminUsers';
import { userService } from '../../services/userService';

export const AdminUserList = () => {
  const [activeTab, setActiveTab] = useState('FARMERS'); // 'FARMERS' | 'VETERINARIANS'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [vets, setVets] = useState([]);

  // Modal states
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getUsers();
      if (allUsers && allUsers.length > 0) {
        const liveFarmers = allUsers.filter((u) => u.role === 'FARMER').map((u) => ({
          ...u,
          id: u._id || u.id,
          mobile: u.phone,
          farmerRefId: u.farmerRefId || u.id || u._id,
          registeredAt: u.createdAt || u.registeredAt || u.updatedAt || new Date().toISOString(),
        }));
        const liveVets = allUsers.filter((u) => u.role === 'VETERINARIAN').map((u) => ({
          ...u,
          id: u._id || u.id,
          mobile: u.phone,
          employeeId: u.employeeId || u.id || u._id,
          districtArea: u.assignedArea || u.district,
          registeredAt: u.createdAt || u.registeredAt || u.updatedAt || new Date().toISOString(),
        }));
        setFarmers(liveFarmers.length > 0 ? liveFarmers : adminUserService.getFarmers());
        setVets(liveVets.length > 0 ? liveVets : adminUserService.getVeterinarians());
        return;
      }
    } catch (e) {
      console.warn('Live users load failed, using local store:', e);
    }
    setFarmers(adminUserService.getFarmers());
    setVets(adminUserService.getVeterinarians());
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Status transition handlers (Activate, Suspend, Revoke)
  const handleSetStatus = async (type, id, newStatus, name) => {
    try {
      await userService.updateUserStatus(id, newStatus);
    } catch (err) {
      console.warn('Backend updateUserStatus error, falling back to mock store update:', err);
    }
    adminUserService.updateUserStatus(type, id, newStatus);
    await loadUsers();
    showToast(`${name || 'User'} status updated to ${newStatus}`);
  };

  // Open Edit Modal
  const handleOpenEdit = (type, user) => {
    setEditingUser({ ...user, _type: type });
    setEditFormData({
      name: user.name,
      mobile: user.mobile,
      village: user.village || '',
      department: user.department || '',
      designation: user.designation || '',
      assignedArea: user.assignedArea || user.districtArea || '',
      status: user.status,
    });
  };

  // Save Edit Modal
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const type = editingUser._type;
    const userId = editingUser.id || editingUser._id;
    const payload = {
      name: editFormData.name,
      mobile: editFormData.mobile,
      status: editFormData.status,
    };

    if (type === 'FARMER') {
      payload.village = editFormData.village;
      payload.assignedArea = editFormData.assignedArea;
    } else {
      payload.department = editFormData.department;
      payload.designation = editFormData.designation;
      payload.districtArea = editFormData.assignedArea;
    }

    try {
      await userService.updateUserStatus(userId, editFormData.status);
    } catch (err) {
      console.warn('Backend updateUserStatus error during edit:', err);
    }

    adminUserService.updateUser(type, userId, payload);
    await loadUsers();
    setEditingUser(null);
    showToast(`Account details for ${payload.name} updated successfully.`);
  };

  // Collect distinct areas for the area filter
  const farmerAreas = useMemo(() => {
    return Array.from(new Set(farmers.map((f) => f.assignedArea).filter(Boolean)));
  }, [farmers]);

  const vetAreas = useMemo(() => {
    return Array.from(new Set(vets.map((v) => v.districtArea).filter(Boolean)));
  }, [vets]);

  const availableAreas = activeTab === 'FARMERS' ? farmerAreas : vetAreas;

  // Filtered Farmers
  const filteredFarmers = farmers.filter((f) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      f.name.toLowerCase().includes(term) ||
      f.mobile.includes(term) ||
      f.village.toLowerCase().includes(term) ||
      f.id.toLowerCase().includes(term) ||
      f.assignedArea.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesArea = areaFilter === 'ALL' || f.assignedArea === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  // Filtered Veterinarians
  const filteredVets = vets.filter((v) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(term) ||
      v.mobile.includes(term) ||
      v.employeeId.toLowerCase().includes(term) ||
      v.department.toLowerCase().includes(term) ||
      v.designation.toLowerCase().includes(term) ||
      v.districtArea.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesArea = areaFilter === 'ALL' || v.districtArea === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* ── Official Notice & Page Header ───────────────────────────────── */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-300/30 text-[11px] font-extrabold uppercase tracking-wider">
                Veterinary Department Administration
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              User Access &amp; Credential Management
            </h1>
            <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
              "Only users registered by the Veterinary Department can access PashuPrahari." Manage account status, suspend unauthorized access, or modify regional assignments.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/admin/users/register-farmer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Farmer</span>
          </Link>
          <Link
            to="/admin/users/register-veterinarian"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-950 hover:bg-purple-50 active:bg-purple-100 text-xs font-black shadow-xs transition-colors"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Register Veterinarian</span>
          </Link>
        </div>
      </div>

      {/* ── Toast Notification Banner ───────────────────────────────────── */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-700 hover:text-emerald-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* ── User Directory Table Card ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Tab Selector & Filter Toolbar */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Two Tabs: FARMERS & VETERINARIANS */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
              <button
                onClick={() => {
                  setActiveTab('FARMERS');
                  setAreaFilter('ALL');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'FARMERS'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>FARMERS ({farmers.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('VETERINARIANS');
                  setAreaFilter('ALL');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'VETERINARIANS'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-purple-600" />
                <span>VETERINARIANS ({vets.length})</span>
              </button>
            </div>

            {/* Total matching indicator */}
            <span className="text-xs font-semibold text-slate-500">
              Showing {activeTab === 'FARMERS' ? filteredFarmers.length : filteredVets.length} registered accounts
            </span>
          </div>

          {/* Filter Bar (Search, Status Filter, Area Filter) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'FARMERS'
                    ? 'Search name, mobile, village, ID...'
                    : 'Search name, mobile, ID, department...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value={USER_STATUSES.ACTIVE}>Status: Active</option>
                <option value={USER_STATUSES.PENDING}>Status: Pending</option>
                <option value={USER_STATUSES.SUSPENDED}>Status: Suspended</option>
                <option value={USER_STATUSES.REVOKED}>Status: Revoked</option>
              </select>
            </div>

            {/* Area Filter */}
            <div className="relative">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="ALL">All Areas / Circles</option>
                {availableAreas.map((area) => (
                  <option key={area} value={area}>
                    Area: {area}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* ── Table: Farmers ──────────────────────────────────────────────── */}
        {activeTab === 'FARMERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Village</th>
                  <th className="py-3.5 px-4">Area</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No registered farmers match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <p className="font-bold text-slate-900">{farmer.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{farmer.id}</p>
                      </td>

                      {/* Mobile */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        +91 {farmer.mobile}
                      </td>

                      {/* Village */}
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1 text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {farmer.village}
                        </span>
                      </td>

                      {/* Area */}
                      <td className="py-4 px-4 text-slate-600">
                        {farmer.assignedArea}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_STYLES[farmer.status] || STATUS_STYLES.ACTIVE}`}>
                          {farmer.status}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                        {(() => {
                          const dateVal = farmer.registeredAt || farmer.createdAt;
                          if (!dateVal) return 'N/A';
                          const d = new Date(dateVal);
                          return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          });
                        })()}
                      </td>

                      {/* Action (View, Edit, Activate, Suspend, Revoke) */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Action */}
                          <button
                            onClick={() => setViewingUser({ ...farmer, _type: 'FARMER' })}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Action */}
                          <button
                            onClick={() => handleOpenEdit('FARMER', farmer)}
                            className="p-1.5 bg-slate-100 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-semibold transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Status quick buttons */}
                          {farmer.status !== USER_STATUSES.ACTIVE && (
                            <button
                              onClick={() => handleSetStatus('FARMER', farmer.id, USER_STATUSES.ACTIVE, farmer.name)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors"
                              title="Activate"
                            >
                              Activate
                            </button>
                          )}

                          {farmer.status === USER_STATUSES.ACTIVE && (
                            <button
                              onClick={() => handleSetStatus('FARMER', farmer.id, USER_STATUSES.SUSPENDED, farmer.name)}
                              className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-[11px] font-bold transition-colors"
                              title="Suspend"
                            >
                              Suspend
                            </button>
                          )}

                          {farmer.status !== USER_STATUSES.REVOKED && (
                            <button
                              onClick={() => handleSetStatus('FARMER', farmer.id, USER_STATUSES.REVOKED, farmer.name)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                              title="Revoke Access"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Table: Veterinarians ────────────────────────────────────────── */}
        {activeTab === 'VETERINARIANS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Employee/Veterinary ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Area</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredVets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No registered veterinarians match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredVets.map((vet) => (
                    <tr key={vet.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <p className="font-bold text-slate-900">{vet.name}</p>
                        <p className="text-[10px] text-slate-500">{vet.designation}</p>
                      </td>

                      {/* Mobile */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        +91 {vet.mobile}
                      </td>

                      {/* Employee/Veterinary ID */}
                      <td className="py-4 px-4 font-mono font-bold text-purple-900">
                        {vet.employeeId}
                      </td>

                      {/* Department */}
                      <td className="py-4 px-4 text-slate-700 max-w-xs truncate">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          {vet.department}
                        </span>
                      </td>

                      {/* Area */}
                      <td className="py-4 px-4 text-slate-600">
                        {vet.districtArea}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_STYLES[vet.status] || STATUS_STYLES.ACTIVE}`}>
                          {vet.status}
                        </span>
                      </td>

                      {/* Action (View, Edit, Activate, Suspend, Revoke) */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Action */}
                          <button
                            onClick={() => setViewingUser({ ...vet, _type: 'VETERINARIAN' })}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Action */}
                          <button
                            onClick={() => handleOpenEdit('VETERINARIAN', vet)}
                            className="p-1.5 bg-slate-100 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-semibold transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Status quick buttons */}
                          {vet.status !== USER_STATUSES.ACTIVE && (
                            <button
                              onClick={() => handleSetStatus('VETERINARIAN', vet.id, USER_STATUSES.ACTIVE, vet.name)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors"
                              title="Activate"
                            >
                              Activate
                            </button>
                          )}

                          {vet.status === USER_STATUSES.ACTIVE && (
                            <button
                              onClick={() => handleSetStatus('VETERINARIAN', vet.id, USER_STATUSES.SUSPENDED, vet.name)}
                              className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-[11px] font-bold transition-colors"
                              title="Suspend"
                            >
                              Suspend
                            </button>
                          )}

                          {vet.status !== USER_STATUSES.REVOKED && (
                            <button
                              onClick={() => handleSetStatus('VETERINARIAN', vet.id, USER_STATUSES.REVOKED, vet.name)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                              title="Revoke Access"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── View User Profile Modal ─────────────────────────────────────── */}
      {viewingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  viewingUser._type === 'FARMER' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {viewingUser._type === 'FARMER' ? <Users className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {viewingUser._type === 'FARMER' ? 'Farmer Profile Record' : 'Veterinarian Credential Record'}
                  </h3>
                  <p className="text-[11px] text-slate-400">PashuPrahari Government Registry</p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Identifier ID:</span>
                <span className="font-mono font-bold text-slate-900">{viewingUser.id || viewingUser.employeeId}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">{viewingUser.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Mobile Number:</span>
                <span className="font-mono font-bold text-slate-900">+91 {viewingUser.mobile}</span>
              </div>

              {viewingUser._type === 'FARMER' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Village &amp; District:</span>
                    <span className="font-semibold text-slate-800">{viewingUser.village}, {viewingUser.district || 'Thane'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Assigned Circle:</span>
                    <span className="font-semibold text-slate-800">{viewingUser.assignedArea}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Department:</span>
                    <span className="font-semibold text-slate-800">{viewingUser.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Designation:</span>
                    <span className="font-semibold text-slate-800">{viewingUser.designation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Jurisdiction Area:</span>
                    <span className="font-semibold text-slate-800">{viewingUser.districtArea}</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Account Status:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${STATUS_STYLES[viewingUser.status]}`}>
                  {viewingUser.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-400">Enrollment Date:</span>
                <span className="text-slate-600 font-mono">
                  {(() => {
                    const dt = viewingUser.registeredAt || viewingUser.createdAt;
                    if (!dt) return 'N/A';
                    const d = new Date(dt);
                    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString('en-IN');
                  })()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Profile Modal ─────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Edit {editingUser._type === 'FARMER' ? 'Farmer Account' : 'Veterinarian Account'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Record ID: {editingUser.id || editingUser.employeeId}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={editFormData.mobile}
                  onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-mono"
                />
              </div>

              {editingUser._type === 'FARMER' ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Village</label>
                    <input
                      type="text"
                      required
                      value={editFormData.village}
                      onChange={(e) => setEditFormData({ ...editFormData, village: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Area / Circle</label>
                    <input
                      type="text"
                      required
                      value={editFormData.assignedArea}
                      onChange={(e) => setEditFormData({ ...editFormData, assignedArea: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={editFormData.department}
                      onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      required
                      value={editFormData.designation}
                      onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jurisdiction Area</label>
                    <input
                      type="text"
                      required
                      value={editFormData.assignedArea}
                      onChange={(e) => setEditFormData({ ...editFormData, assignedArea: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-bold"
                >
                  <option value={USER_STATUSES.ACTIVE}>ACTIVE</option>
                  <option value={USER_STATUSES.PENDING}>PENDING</option>
                  <option value={USER_STATUSES.SUSPENDED}>SUSPENDED</option>
                  <option value={USER_STATUSES.REVOKED}>REVOKED</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
