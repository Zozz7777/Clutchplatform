'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Search, Shield, Users, Trash2, Edit } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface Role {
  _id: string
  name: string
  description: string
  permissions: string[]
  createdAt: string
  userCount: number
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
}

export default function RolesManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  
  const queryClient = useQueryClient()

  // Fetch roles
  const { data: rolesResponse, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiClient.get('/auth/roles'),
    staleTime: 5 * 60 * 1000,
  })

  const roles: Role[] = Array.isArray(rolesResponse) ? rolesResponse : (rolesResponse?.data as Role[]) || []

  // Fetch users for role assignment
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['users', userSearchTerm],
    queryFn: () => apiClient.get(`/auth/users?search=${encodeURIComponent(userSearchTerm)}&limit=50`),
    enabled: isAssignDialogOpen,
    staleTime: 2 * 60 * 1000,
  })

  const users: User[] = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data as User[]) || []

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (roleData: { name: string; description: string; permissions: string[] }) =>
      apiClient.post('/auth/roles', roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsCreateDialogOpen(false)
      setNewRole({ name: '', description: '', permissions: [] })
      toast.success('Role created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create role')
    },
  })

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, roleData }: { roleId: string; roleData: Partial<Role> }) =>
      apiClient.put(`/auth/roles/${roleId}`, roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsEditDialogOpen(false)
      setSelectedRole(null)
      toast.success('Role updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role')
    },
  })

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => apiClient.delete(`/auth/roles/${roleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete role')
    },
  })

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      apiClient.post(`/auth/users/${userId}/roles`, { roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsAssignDialogOpen(false)
      setSelectedUser(null)
      toast.success('Role assigned successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign role')
    },
  })

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      apiClient.delete(`/auth/users/${userId}/roles/${roleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role removed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove role')
    },
  })

  const availablePermissions = [
    'users.read', 'users.write', 'users.delete',
    'roles.read', 'roles.write', 'roles.delete',
    'vehicles.read', 'vehicles.write', 'vehicles.delete',
    'fleet.read', 'fleet.write', 'fleet.delete',
    'analytics.read', 'analytics.write',
    'settings.read', 'settings.write',
    'security.read', 'security.write',
    'system.read', 'system.write'
  ]

  const filteredRoles = roles.filter((role: Role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast.error('Role name is required')
      return
    }
    createRoleMutation.mutate(newRole)
  }

  const handleUpdateRole = () => {
    if (!selectedRole) return
    updateRoleMutation.mutate({
      roleId: selectedRole._id,
      roleData: selectedRole
    })
  }

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      deleteRoleMutation.mutate(roleId)
    }
  }

  const handleAssignRole = (userId: string, roleId: string) => {
    assignRoleMutation.mutate({ userId, roleId })
  }

  const handleRemoveRole = (userId: string, roleId: string) => {
    if (confirm('Are you sure you want to remove this role from the user?')) {
      removeRoleMutation.mutate({ userId, roleId })
    }
  }

  const togglePermission = (permission: string) => {
    if (selectedRole) {
      const updatedPermissions = selectedRole.permissions.includes(permission)
        ? selectedRole.permissions.filter(p => p !== permission)
        : [...selectedRole.permissions, permission]
      setSelectedRole({ ...selectedRole, permissions: updatedPermissions })
    } else {
      const updatedPermissions = newRole.permissions.includes(permission)
        ? newRole.permissions.filter(p => p !== permission)
        : [...newRole.permissions, permission]
      setNewRole({ ...newRole, permissions: updatedPermissions })
    }
  }

  if (rolesError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load roles: {rolesError.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the platform
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Fleet Manager"
                />
              </div>
              <div>
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe the role's responsibilities"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="rounded"
                      />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending}>
                {createRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {rolesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role: Role) => (
            <Card key={role._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role._id)}
                      disabled={deleteRoleMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{role.userCount} users</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedRole(role)
                    setIsAssignDialogOpen(true)
                  }}
                >
                  Assign to Users
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role-description">Description</Label>
                <Textarea
                  id="edit-role-description"
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedRole.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="rounded"
                      />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Role to Users</DialogTitle>
            <DialogDescription>
              Search and assign the "{selectedRole?.name}" role to users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-search">Search Users</Label>
              <Input
                id="user-search"
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {usersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                users.map((user: User) => (
                  <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.roles.map((roleId) => {
                          const role = roles.find((r: Role) => r._id === roleId)
                          return role ? (
                            <Badge key={roleId} variant="secondary" className="text-xs">
                              {role.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.roles.includes(selectedRole?._id || '') ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveRole(user._id, selectedRole!._id)}
                          disabled={removeRoleMutation.isPending}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAssignRole(user._id, selectedRole!._id)}
                          disabled={assignRoleMutation.isPending}
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
