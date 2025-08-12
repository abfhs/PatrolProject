import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui';
import styles from './AdminDashboard.module.css';
import { apiClient } from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  totalSchedules: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 어드민 권한 확인
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }

    loadDashboardStats();
  }, [navigate]);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAdminDashboard();
      setStats(response);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>로딩 중...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <h1>관리자 대시보드</h1>
          <p>시스템 현황 및 통계</p>
        </div>

        <div className={styles.statsGrid}>
          <Card variant="admin" className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>총 사용자</h3>
              <div className={styles.statNumber}>{stats?.totalUsers || 0}</div>
              <p>등록된 전체 사용자 수</p>
            </div>
          </Card>

          <Card variant="admin" className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <h3>스케줄 작업</h3>
              <div className={styles.statNumber}>{stats?.totalSchedules || 0}</div>
              <p>등록된 스케줄 작업 수</p>
            </div>
          </Card>

          <Card variant="admin" className={styles.statCard}>
            <div className={styles.statIcon}>⚡</div>
            <div className={styles.statContent}>
              <h3>시스템 상태</h3>
              <div className={styles.statStatus}>정상</div>
              <p>모든 서비스 정상 작동</p>
            </div>
          </Card>

          <Card variant="admin" className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>오늘 실행</h3>
              <div className={styles.statNumber}>-</div>
              <p>스케줄러 실행 현황</p>
            </div>
          </Card>
        </div>

        <div className={styles.quickActions}>
          <h2>빠른 작업</h2>
          <div className={styles.actionGrid}>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/admin/users')}
            >
              <span className={styles.actionIcon}>👥</span>
              <span>사용자 관리</span>
            </button>
            
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/admin/schedules')}
            >
              <span className={styles.actionIcon}>📅</span>
              <span>스케줄 관리</span>
            </button>
            
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/admin/logs')}
            >
              <span className={styles.actionIcon}>📋</span>
              <span>로그 확인</span>
            </button>
            
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};