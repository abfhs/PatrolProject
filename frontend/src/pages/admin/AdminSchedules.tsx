import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, Button } from '../../components/ui';
import styles from './AdminSchedules.module.css';
import { apiClient } from '../../services/api';

interface Schedule {
  id: number;
  addressPin: string;
  ownerName: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [runLoading, setRunLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 어드민 권한 확인
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }

    loadSchedules();
  }, [navigate]);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAdminSchedules();
      setSchedules(response);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      alert('스케줄 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    const confirmed = confirm('정말로 이 스케줄을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      setDeleteLoading(scheduleId);
      await apiClient.deleteAdminSchedule(scheduleId);
      await loadSchedules(); // 목록 새로고침
      alert('스케줄이 성공적으로 삭제되었습니다.');
    } catch (error: any) {
      console.error('Failed to delete schedule:', error);
      alert(error.response?.data?.message || '스케줄 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRunScheduler = async () => {
    const confirmed = confirm('스케줄러를 수동으로 실행하시겠습니까? 모든 등록된 스케줄 작업이 실행됩니다.');
    if (!confirmed) return;

    try {
      setRunLoading(true);
      const response = await apiClient.runAdminScheduler();
      alert(response.message);
    } catch (error: any) {
      console.error('Failed to run scheduler:', error);
      alert(error.response?.data?.message || '스케줄러 실행에 실패했습니다.');
    } finally {
      setRunLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>스케줄 목록을 불러오는 중...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.schedulesPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <div>
              <h1>스케줄러 관리</h1>
              <p>등록된 스케줄 작업을 관리하고 수동으로 실행할 수 있습니다.</p>
            </div>
            <Button
              variant="primary"
              onClick={handleRunScheduler}
              disabled={runLoading}
              className={styles.runButton}
            >
              {runLoading ? '실행 중...' : '▶️ 스케줄러 수동 실행'}
            </Button>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>총 스케줄:</span>
              <span className={styles.statValue}>{schedules.length}개</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>다음 실행:</span>
              <span className={styles.statValue}>매일 오전 11시</span>
            </div>
          </div>
        </div>

        <Card variant="admin" className={styles.schedulesTable}>
          <div className={styles.tableHeader}>
            <h3>스케줄 목록</h3>
            <Button
              variant="secondary"
              size="small"
              onClick={loadSchedules}
            >
              🔄 새로고침
            </Button>
          </div>

          {schedules.length === 0 ? (
            <div className={styles.emptyState}>
              등록된 스케줄이 없습니다.
              <p>사용자들이 등기정보를 저장할 때 자동으로 스케줄이 등록됩니다.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>주소 PIN</th>
                    <th>소유자명</th>
                    <th>사용자 이메일</th>
                    <th>주소</th>
                    <th>등록일</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>#{schedule.id}</td>
                      <td className={styles.pin}>{schedule.addressPin}</td>
                      <td className={styles.ownerName}>{schedule.ownerName}</td>
                      <td className={styles.email}>{schedule.email}</td>
                      <td className={styles.address} title={schedule.address}>
                        {schedule.address.length > 30 
                          ? `${schedule.address.substring(0, 30)}...` 
                          : schedule.address
                        }
                      </td>
                      <td className={styles.date}>
                        {formatDate(schedule.createdAt)}
                      </td>
                      <td>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          disabled={deleteLoading === schedule.id}
                        >
                          {deleteLoading === schedule.id ? '삭제 중...' : '🗑️ 삭제'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card variant="admin" className={styles.infoCard}>
          <h3>📋 스케줄러 정보</h3>
          <div className={styles.infoContent}>
            <div className={styles.infoItem}>
              <strong>실행 시간:</strong> 매일 오전 11시 (한국 시간)
            </div>
            <div className={styles.infoItem}>
              <strong>작업 내용:</strong> 등록된 각 스케줄에 대해 executeCustomTask 함수 실행
            </div>
            <div className={styles.infoItem}>
              <strong>입력 데이터:</strong> addressPin, ownerName, email, address
            </div>
            <div className={styles.infoItem}>
              <strong>로그:</strong> 모든 실행 결과는 로그 관리 페이지에서 확인 가능
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};