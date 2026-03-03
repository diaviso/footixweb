import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usersService } from '@/services/users.service';
import type { User, UserStats } from '@/services/users.service';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Badge } from '@/components/ui/badge';

export function UsersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN',
  });
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async (page = 1, search?: string, role?: string) => {
    try {
      setLoading(true);
      const result = await usersService.getAll(page, 50, search, role);
      setUsers(result.data);
      setTotalPages(result.totalPages);
      setTotalUsers(result.total);
      setCurrentPage(result.page);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchStats = async () => {
    try {
      const data = await usersService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchTerm, roleFilter);
    fetchStats();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchTerm, roleFilter);
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchTerm, roleFilter]);

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchTerm, roleFilter);
  };

  const filteredUsers = users;

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({ firstName: '', lastName: '', email: '', role: 'USER' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await usersService.update(editingUser.id, formData);
        toast({ title: 'Utilisateur mis à jour', description: 'Les modifications ont été sauvegardées.' });
      } else {
        await usersService.create(formData);
        toast({ title: 'Utilisateur créé', description: 'Le nouvel utilisateur a été ajouté.' });
      }
      setIsDialogOpen(false);
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersService.delete(id);
      toast({ title: 'Utilisateur supprimé', description: "L'utilisateur a été retiré." });
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive',
      });
    }
  };

  const toggleVerification = async (id: string) => {
    try {
      await usersService.toggleVerification(id);
      toast({ title: 'Statut mis à jour' });
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  const statsData = stats ? [
    { label: 'Total joueurs', value: stats.total, icon: Users, color: 'text-[#C41E3A] dark:text-[#E74C5E]', bg: 'bg-gradient-to-br from-[#C41E3A]/15 to-[#C41E3A]/5 dark:from-[#C41E3A]/25 dark:to-[#C41E3A]/10' },
    { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-[#D4AF37]', bg: 'bg-gradient-to-br from-[#D4AF37]/15 to-[#D4AF37]/5 dark:from-[#D4AF37]/25 dark:to-[#D4AF37]/10' },
    { label: 'Vérifiés', value: stats.verified, icon: UserCheck, color: 'text-[#3B82F6]', bg: 'bg-gradient-to-br from-[#3B82F6]/15 to-[#3B82F6]/5 dark:from-[#3B82F6]/25 dark:to-[#3B82F6]/10' },
    { label: 'En attente', value: stats.pending, icon: UserX, color: 'text-amber-500', bg: 'bg-gradient-to-br from-amber-500/15 to-amber-500/5 dark:from-amber-500/25 dark:to-amber-500/10' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#C41E3A] dark:text-[#E74C5E] mx-auto" />
          <p className="mt-4 text-[#5E7A9A]">Chargement des joueurs...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ScoreboardHeader */}
      <motion.div variants={staggerItem}>
        <ScoreboardHeader
          title="Joueurs"
          subtitle="Liste des inscrits"
          icon={<Users className="h-6 w-6" />}
          rightContent={
            <Button onClick={openCreateDialog} size="sm" className="bg-[#C41E3A] hover:bg-[#9B1B30] text-white gap-2">
              <Plus className="h-4 w-4" />
              Nouveau
            </Button>
          }
        />
      </motion.div>

      {/* Pitch line separator */}
      <div className="pitch-line" />

      {/* Stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className="border border-[#DCE6F0] dark:border-[#1B2B40] shadow-sm hover:shadow-md transition-all bg-white dark:bg-[#0D1525]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn('p-3 rounded-xl border border-white/10', stat.bg)}>
                  <stat.icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0A1628] dark:text-[#E2E8F5]">{stat.value}</p>
                  <p className="text-sm text-[#5E7A9A]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={staggerItem}>
        <Card className="border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525]">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
                <Input
                  placeholder="Rechercher un joueur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#5E7A9A]" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] h-11">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="USER">Utilisateurs</SelectItem>
                    <SelectItem value="ADMIN">Administrateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pitch line separator */}
      <div className="pitch-line" />

      {/* Users Table */}
      <motion.div variants={staggerItem}>
        <Card className="border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525]">
          <CardHeader>
            <CardTitle className="text-[#0A1628] dark:text-[#E2E8F5]">Liste des joueurs</CardTitle>
            <CardDescription className="text-[#5E7A9A]">
              {totalUsers} joueur{totalUsers > 1 ? 's' : ''} trouvé{totalUsers > 1 ? 's' : ''}
              {totalPages > 1 && ` -- Page ${currentPage}/${totalPages}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#111B2E]/50 hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E] transition-colors border border-transparent hover:border-[#DCE6F0] dark:hover:border-[#1B2B40]"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11 border-2 border-[#DCE6F0] dark:border-[#1B2B40]">
                      <AvatarImage src="" alt={user.firstName} />
                      <AvatarFallback className="bg-gradient-to-br from-[#C41E3A] to-[#9B1B30] text-white font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#0A1628] dark:text-[#E2E8F5]">
                          {user.firstName} {user.lastName}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            user.role === 'ADMIN'
                              ? 'border-[#C41E3A]/30 bg-[#C41E3A]/10 text-[#C41E3A] dark:text-[#E74C5E]'
                              : 'border-[#DCE6F0] dark:border-[#1B2B40] text-[#5E7A9A]'
                          )}
                        >
                          {user.role === 'ADMIN' ? 'Admin' : 'User'}
                        </Badge>
                        {user.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#3B82F6]">
                            <UserCheck className="h-3 w-3" />
                            Vérifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                            <UserX className="h-3 w-3" />
                            Non vérifié
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#5E7A9A] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(user)} className="cursor-pointer">
                        <Edit2 className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleVerification(user.id)} className="cursor-pointer">
                        {user.isEmailVerified ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Retirer vérification
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Vérifier
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(user.id)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#DCE6F0] dark:border-[#1B2B40]">
                <p className="text-sm text-[#5E7A9A]">
                  Page {currentPage} sur {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={cn('w-9', pageNum === currentPage && 'bg-[#C41E3A] hover:bg-[#9B1B30]')}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Modifiez les informations de l\'utilisateur.'
                : 'Créez un nouveau compte utilisateur.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'USER' | 'ADMIN') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Utilisateur</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-[#C41E3A] hover:bg-[#9B1B30] text-white">
              {editingUser ? 'Sauvegarder' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
