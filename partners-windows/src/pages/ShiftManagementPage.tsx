import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PlayIcon, 
  StopIcon, 
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Shift {
  id: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
  totalTransactions: number;
  status: 'active' | 'closed';
  userId: string;
  userName: string;
}

interface CashDrawer {
  id: string;
  name: string;
  isOpen: boolean;
  lastOpened: string;
  lastClosed: string;
}

const ShiftManagementPage: React.FC = () => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [cashDrawers, setCashDrawers] = useState<CashDrawer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStartShiftModal, setShowStartShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [startingCash, setStartingCash] = useState('');
  const [endingCash, setEndingCash] = useState('');
  const [selectedDrawer, setSelectedDrawer] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadCurrentShift();
    loadShifts();
    loadCashDrawers();
  }, []);

  const loadCurrentShift = async () => {
    try {
      setIsLoading(true);
      // Mock implementation - in real app, this would query the database
      const mockShift: Shift = {
        id: 'shift_001',
        startTime: new Date().toISOString(),
        startingCash: 1000,
        totalSales: 0,
        totalTransactions: 0,
        status: 'active',
        userId: 'user_001',
        userName: 'Current User'
      };
      setCurrentShift(mockShift);
    } catch (error) {
      console.error('Failed to load current shift:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadShifts = async () => {
    try {
      // Mock implementation
      const mockShifts: Shift[] = [
        {
          id: 'shift_001',
          startTime: '2024-01-15T08:00:00Z',
          endTime: '2024-01-15T17:00:00Z',
          startingCash: 1000,
          endingCash: 1200,
          totalSales: 5000,
          totalTransactions: 25,
          status: 'closed',
          userId: 'user_001',
          userName: 'Ahmed Ali'
        },
        {
          id: 'shift_002',
          startTime: '2024-01-14T08:00:00Z',
          endTime: '2024-01-14T17:00:00Z',
          startingCash: 1000,
          endingCash: 1100,
          totalSales: 4500,
          totalTransactions: 22,
          status: 'closed',
          userId: 'user_001',
          userName: 'Ahmed Ali'
        }
      ];
      setShifts(mockShifts);
    } catch (error) {
      console.error('Failed to load shifts:', error);
    }
  };

  const loadCashDrawers = async () => {
    try {
      // Mock implementation
      const mockDrawers: CashDrawer[] = [
        {
          id: 'drawer_001',
          name: 'Main Cash Drawer',
          isOpen: true,
          lastOpened: '2024-01-15T08:00:00Z',
          lastClosed: '2024-01-14T17:00:00Z'
        }
      ];
      setCashDrawers(mockDrawers);
    } catch (error) {
      console.error('Failed to load cash drawers:', error);
    }
  };

  const startShift = async () => {
    try {
      setIsProcessing(true);
      
      const newShift: Shift = {
        id: `shift_${Date.now()}`,
        startTime: new Date().toISOString(),
        startingCash: parseFloat(startingCash) || 0,
        totalSales: 0,
        totalTransactions: 0,
        status: 'active',
        userId: 'user_001',
        userName: 'Current User'
      };

      // Save to database
      await window.electronAPI.dbExec(
        `INSERT INTO shifts (id, start_time, starting_cash, total_sales, total_transactions, status, user_id, user_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newShift.id,
          newShift.startTime,
          newShift.startingCash,
          newShift.totalSales,
          newShift.totalTransactions,
          newShift.status,
          newShift.userId,
          newShift.userName
        ]
      );

      setCurrentShift(newShift);
      setShowStartShiftModal(false);
      setStartingCash('');

      await window.electronAPI.showNotification({
        title: 'تم بدء الوردية',
        body: `تم بدء الوردية بنجاح مع ${newShift.startingCash} EGP نقداً`,
        urgency: 'normal'
      });

    } catch (error) {
      console.error('Failed to start shift:', error);
      await window.electronAPI.showNotification({
        title: 'فشل بدء الوردية',
        body: 'حدث خطأ أثناء بدء الوردية',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const closeShift = async () => {
    if (!currentShift) return;

    try {
      setIsProcessing(true);
      
      const endingCashAmount = parseFloat(endingCash) || 0;
      const cashDifference = endingCashAmount - currentShift.startingCash;

      // Update shift in database
      await window.electronAPI.dbExec(
        `UPDATE shifts SET 
         end_time = ?, ending_cash = ?, status = 'closed'
         WHERE id = ?`,
        [
          new Date().toISOString(),
          endingCashAmount,
          currentShift.id
        ]
      );

      // Create shift summary
      const shiftSummary = {
        shiftId: currentShift.id,
        startTime: currentShift.startTime,
        endTime: new Date().toISOString(),
        startingCash: currentShift.startingCash,
        endingCash: endingCashAmount,
        cashDifference: cashDifference,
        totalSales: currentShift.totalSales,
        totalTransactions: currentShift.totalTransactions
      };

      // Print shift summary
      await window.electronAPI.printShiftSummary(shiftSummary);

      setCurrentShift(null);
      setShowCloseShiftModal(false);
      setEndingCash('');
      await loadShifts();

      await window.electronAPI.showNotification({
        title: 'تم إغلاق الوردية',
        body: `تم إغلاق الوردية بنجاح. الفرق في النقد: ${cashDifference} EGP`,
        urgency: 'normal'
      });

    } catch (error) {
      console.error('Failed to close shift:', error);
      await window.electronAPI.showNotification({
        title: 'فشل إغلاق الوردية',
        body: 'حدث خطأ أثناء إغلاق الوردية',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openCashDrawer = async (drawerId: string) => {
    try {
      // Open cash drawer
      await window.electronAPI.openCashDrawer(drawerId);
      
      await window.electronAPI.showNotification({
        title: 'تم فتح درج النقد',
        body: 'تم فتح درج النقد بنجاح',
        urgency: 'normal'
      });
    } catch (error) {
      console.error('Failed to open cash drawer:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الورديات</h1>
        <div className="flex items-center space-x-4">
          {!currentShift ? (
            <Button
              variant="primary"
              onClick={() => setShowStartShiftModal(true)}
              className="flex items-center"
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              بدء وردية جديدة
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setShowCloseShiftModal(true)}
              className="flex items-center"
            >
              <StopIcon className="w-4 h-4 mr-2" />
              إغلاق الوردية
            </Button>
          )}
        </div>
      </div>

      {/* Current Shift Status */}
      {currentShift && (
        <Card title="الوردية الحالية">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {new Date(currentShift.startTime).toLocaleTimeString('ar-EG')}
              </div>
              <div className="text-sm text-muted-foreground">وقت البداية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {currentShift.totalSales.toFixed(2)} EGP
              </div>
              <div className="text-sm text-muted-foreground">إجمالي المبيعات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">
                {currentShift.totalTransactions}
              </div>
              <div className="text-sm text-muted-foreground">عدد المعاملات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {currentShift.startingCash.toFixed(2)} EGP
              </div>
              <div className="text-sm text-muted-foreground">النقد الابتدائي</div>
            </div>
          </div>
        </Card>
      )}

      {/* Cash Drawers */}
      <Card title="أدراج النقد">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cashDrawers.map((drawer) => (
            <div key={drawer.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{drawer.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  drawer.isOpen ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted-foreground'
                }`}>
                  {drawer.isOpen ? 'مفتوح' : 'مغلق'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                آخر فتح: {new Date(drawer.lastOpened).toLocaleString('ar-EG')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCashDrawer(drawer.id)}
                className="w-full"
              >
                فتح الدرج
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Shifts */}
      <Card title="الورديات الأخيرة">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right py-3 px-4">التاريخ</th>
                <th className="text-right py-3 px-4">المستخدم</th>
                <th className="text-right py-3 px-4">وقت البداية</th>
                <th className="text-right py-3 px-4">وقت النهاية</th>
                <th className="text-right py-3 px-4">النقد الابتدائي</th>
                <th className="text-right py-3 px-4">النقد النهائي</th>
                <th className="text-right py-3 px-4">إجمالي المبيعات</th>
                <th className="text-right py-3 px-4">عدد المعاملات</th>
                <th className="text-right py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="border-b border-border">
                  <td className="py-3 px-4">
                    {new Date(shift.startTime).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-3 px-4">{shift.userName}</td>
                  <td className="py-3 px-4">
                    {new Date(shift.startTime).toLocaleTimeString('ar-EG')}
                  </td>
                  <td className="py-3 px-4">
                    {shift.endTime ? new Date(shift.endTime).toLocaleTimeString('ar-EG') : '-'}
                  </td>
                  <td className="py-3 px-4">{shift.startingCash.toFixed(2)} EGP</td>
                  <td className="py-3 px-4">
                    {shift.endingCash ? `${shift.endingCash.toFixed(2)} EGP` : '-'}
                  </td>
                  <td className="py-3 px-4">{shift.totalSales.toFixed(2)} EGP</td>
                  <td className="py-3 px-4">{shift.totalTransactions}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      shift.status === 'active' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted/10 text-muted-foreground'
                    }`}>
                      {shift.status === 'active' ? 'نشط' : 'مغلق'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Start Shift Modal */}
      {showStartShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">بدء وردية جديدة</h2>
              <Button variant="ghost" onClick={() => setShowStartShiftModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">النقد الابتدائي (EGP)</label>
                <Input
                  type="number"
                  value={startingCash}
                  onChange={setStartingCash}
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <Button variant="ghost" onClick={() => setShowStartShiftModal(false)}>
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={startShift}
                disabled={!startingCash || isProcessing}
                loading={isProcessing}
              >
                بدء الوردية
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Close Shift Modal */}
      {showCloseShiftModal && currentShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">إغلاق الوردية</h2>
              <Button variant="ghost" onClick={() => setShowCloseShiftModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">ملخص الوردية</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>النقد الابتدائي:</span>
                    <span>{currentShift.startingCash.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي المبيعات:</span>
                    <span>{currentShift.totalSales.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد المعاملات:</span>
                    <span>{currentShift.totalTransactions}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">النقد النهائي (EGP)</label>
                <Input
                  type="number"
                  value={endingCash}
                  onChange={setEndingCash}
                  placeholder="1200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <Button variant="ghost" onClick={() => setShowCloseShiftModal(false)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={closeShift}
                disabled={!endingCash || isProcessing}
                loading={isProcessing}
              >
                إغلاق الوردية
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ShiftManagementPage;
