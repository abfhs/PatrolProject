import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, Button } from '../../components/ui';
import styles from './AdminLogs.module.css';
import { apiClient } from '../../services/api';

interface TaskLog {
  id: number;
  taskName: string;
  status: 'running' | 'success' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  result?: string;
  error?: string;
}

interface LogStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageRunTime: number;
  dailyStats: Array<{
    date: string;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageRunTime: number;
  }>;
}

export const AdminLogs = () => {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statsDays, setStatsDays] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    // 어드민 권한 확인
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }

    loadLogs();
    loadStats();
  }, [navigate, currentPage, selectedDate]);

  useEffect(() => {
    loadStats();
  }, [statsDays]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAdminSchedulerLogs(currentPage, 20, selectedDate);
      setLogs(response.logs);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load logs:', error);
      alert('로그를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await apiClient.getAdminSchedulerStats(statsDays);
      setStats(response);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}초`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#51cf66';
      case 'failed': return '#ff6b6b';
      case 'running': return '#ffd43b';
      default: return '#a0a0a0';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '성공';
      case 'failed': return '실패';
      case 'running': return '실행 중';
      default: return status;
    }
  };

  if (isLoading && currentPage === 1) {
    return (
      <AdminLayout>
        <div className={styles.loading}>로그를 불러오는 중...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.logsPage}>
        <div className={styles.pageHeader}>
          <h1>로그 관리</h1>
          <p>스케줄러 실행 로그와 통계를 확인할 수 있습니다.</p>
        </div>

        {!statsLoading && stats && (
          <div className={styles.statsSection}>
            <div className={styles.statsHeader}>
              <h2>📊 통계 정보</h2>
              <div className={styles.statsControls}>
                <select 
                  value={statsDays} 
                  onChange={(e) => setStatsDays(Number(e.target.value))}
                  className={styles.periodSelect}
                >
                  <option value={7}>최근 7일</option>
                  <option value={30}>최근 30일</option>
                  <option value={90}>최근 90일</option>
                </select>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <Card variant="admin" className={styles.statCard}>
                <div className={styles.statIcon}>📊</div>
                <div className={styles.statContent}>
                  <h3>총 실행</h3>
                  <div className={styles.statNumber}>{stats.totalRuns}</div>
                  <p>전체 실행 횟수</p>
                </div>
              </Card>

              <Card variant="admin" className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statContent}>
                  <h3>성공</h3>
                  <div className={styles.statNumber} style={{ color: '#51cf66' }}>
                    {stats.successfulRuns}
                  </div>
                  <p>성공한 작업 수</p>
                </div>
              </Card>

              <Card variant="admin" className={styles.statCard}>
                <div className={styles.statIcon}>❌</div>
                <div className={styles.statContent}>
                  <h3>실패</h3>
                  <div className={styles.statNumber} style={{ color: '#ff6b6b' }}>
                    {stats.failedRuns}
                  </div>
                  <p>실패한 작업 수</p>
                </div>
              </Card>

              <Card variant="admin" className={styles.statCard}>
                <div className={styles.statIcon}>⏱️</div>
                <div className={styles.statContent}>
                  <h3>평균 실행 시간</h3>
                  <div className={styles.statNumber}>
                    {formatDuration(stats.averageRunTime)}
                  </div>
                  <p>작업당 평균 소요 시간</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        <Card variant="admin" className={styles.logsTable}>
          <div className={styles.tableHeader}>
            <h3>실행 로그</h3>
            <div className={styles.tableControls}>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateFilter}
                className={styles.dateInput}
              />
              <Button
                variant="secondary"
                size="small"
                onClick={loadLogs}
              >
                🔄 새로고침
              </Button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className={styles.emptyState}>
              {selectedDate ? '해당 날짜의 로그가 없습니다.' : '실행 로그가 없습니다.'}
              <p>스케줄러가 실행되면 로그가 여기에 표시됩니다.</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>작업명</th>
                      <th>상태</th>
                      <th>시작 시간</th>
                      <th>종료 시간</th>
                      <th>실행 시간</th>
                      <th>처리/성공/실패</th>
                      <th>세부 정보</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>#{log.id}</td>
                        <td className={styles.taskName}>{log.taskName}</td>
                        <td>
                          <span 
                            className={styles.statusTag}
                            style={{ color: getStatusColor(log.status) }}
                          >
                            {getStatusText(log.status)}
                          </span>
                        </td>
                        <td className={styles.date}>
                          {formatDate(log.startTime)}
                        </td>
                        <td className={styles.date}>
                          {log.endTime ? formatDate(log.endTime) : '-'}
                        </td>
                        <td className={styles.duration}>
                          {formatDuration(log.duration)}
                        </td>
                        <td className={styles.counts}>
                          <span className={styles.countItem}>
                            📊 {log.processedCount}
                          </span>
                          <span className={styles.countItem} style={{ color: '#51cf66' }}>
                            ✅ {log.successCount}
                          </span>
                          <span className={styles.countItem} style={{ color: '#ff6b6b' }}>
                            ❌ {log.failureCount}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.detailButton}
                            onClick={() => {
                              const details = log.error || log.result || '세부 정보 없음';
                              alert(details);
                            }}
                          >
                            📋 상세
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};