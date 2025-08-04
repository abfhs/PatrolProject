import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, Button } from '../../components/ui';
import styles from './AdminUsers.module.css';
import { apiClient } from '../../services/api';

interface User {
  id: number;
  nickname: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 어드민 권한 확인
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAdminUsers();
      setUsers(response);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (userEmail === 'superuser@admin.com') {
      alert('관리자 계정은 삭제할 수 없습니다.');
      return;
    }

    const confirmed = confirm('정말로 이 사용자를 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      setDeleteLoading(userId);
      await apiClient.deleteAdminUser(userId);
      await loadUsers(); // 목록 새로고침
      alert('사용자가 성공적으로 삭제되었습니다.');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.message || '사용자 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'ADMIN': return '관리자';
      case 'USER': return '일반 사용자';
      case 'MEMBER': return '멤버';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#4dabf7';
      case 'USER': return '#51cf66';
      case 'MEMBER': return '#ffd43b';
      default: return '#a0a0a0';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>사용자 목록을 불러오는 중...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.usersPage}>
        <div className={styles.pageHeader}>
          <h1>사용자 관리</h1>
          <p>등록된 모든 사용자를 관리할 수 있습니다.</p>
          <div className={styles.stats}>
            총 {users.length}명의 사용자가 등록되어 있습니다.
          </div>
        </div>

        <Card variant="admin" className={styles.usersTable}>
          <div className={styles.tableHeader}>
            <h3>사용자 목록</h3>
            <Button
              variant="secondary"
              size="small"
              onClick={loadUsers}
            >
              🔄 새로고침
            </Button>
          </div>

          {users.length === 0 ? (
            <div className={styles.emptyState}>
              등록된 사용자가 없습니다.
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>닉네임</th>
                    <th>이메일</th>
                    <th>역할</th>
                    <th>가입일</th>
                    <th>마지막 수정</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td className={styles.nickname}>{user.nickname}</td>
                      <td className={styles.email}>{user.email}</td>
                      <td>
                        <span 
                          className={styles.roleTag}
                          style={{ color: getRoleColor(user.role) }}
                        >
                          {getRoleDisplay(user.role)}
                        </span>
                      </td>
                      <td className={styles.date}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td className={styles.date}>
                        {formatDate(user.updatedAt)}
                      </td>
                      <td>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={deleteLoading === user.id || user.email === 'superuser@admin.com'}
                        >
                          {deleteLoading === user.id ? '삭제 중...' : '🗑️ 삭제'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};