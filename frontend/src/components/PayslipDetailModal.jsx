import React from 'react';
import { X, Download, Printer, FileText } from 'lucide-react';

const PayslipDetailModal = ({ 
  isOpen, 
  onClose, 
  payslip, 
  employee 
}) => {
  if (!isOpen || !payslip) return null;

  const handleDownloadPDF = () => {
    // Create a new window with the payslip content for PDF generation
    const printWindow = window.open('', '_blank');
    const content = document.getElementById('payslip-detail-content');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Pay Slip - ${employee?.first_name} ${employee?.last_name} - ${payslip.month}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .employee-info { background-color: #f9f9f9; }
            .earnings { background-color: #f0fdf4; }
            .deductions { background-color: #fef2f2; }
            .net-salary { background: linear-gradient(to right, #3b82f6, #2563eb); color: white; }
            .flex { display: flex; justify-content: space-between; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .text-sm { font-size: 14px; }
            .font-medium { font-weight: 500; }
            .font-bold { font-weight: 700; }
            .text-red-600 { color: #dc2626; }
            .text-green-600 { color: #16a34a; }
            .text-blue-600 { color: #2563eb; }
            .border-b { border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .py-2 { padding: 8px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatMonth = (month) => {
    if (!month) return '';
    // Handle both "YYYY-MM" format and month number
    let monthNum, year;
    if (typeof month === 'string' && month.includes('-')) {
      [year, monthNum] = month.split('-');
    } else if (payslip.pay_month && payslip.pay_year) {
      monthNum = payslip.pay_month;
      year = payslip.pay_year;
    } else {
      return 'N/A';
    }
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pay Slip</h2>
              <p className="text-sm text-gray-600">
                {employee?.first_name} {employee?.last_name} - {formatMonth(payslip.month)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)] print:max-h-none">
          <div id="payslip-detail-content" className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4 border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">SmartPay SaaS</h2>
                <p className="text-sm text-gray-600">Payroll Management System</p>
                <p className="text-sm text-gray-600">Morocco</p>
                <p className="text-sm text-gray-600">ICE: 123456789</p>
                <p className="text-sm text-gray-600">CNSS: CNSS123456</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-blue-600">PAY SLIP</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {formatMonth(payslip.month || `${payslip.pay_year}-${String(payslip.pay_month).padStart(2, '0')}`)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {payslip.generated_at ? `Generated on ${new Date(payslip.generated_at).toLocaleDateString('en-US')}` : ''}
                </p>
              </div>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Employee</p>
                <p className="font-semibold">{employee?.first_name} {employee?.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="font-semibold">{employee?.position}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">CIN</p>
                <p className="font-semibold">{employee?.cin || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">CNSS</p>
                <p className="font-semibold">{employee?.cnss_number || '-'}</p>
              </div>
            </div>

            {/* Earnings */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">EARNINGS</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Salary</span>
                  <span className="font-medium text-gray-950">{Number(payslip.base_salary || 0).toFixed(2)} MAD</span>
                </div>
                {(Number(payslip.bonus_amount || 0) > 0 || Number(payslip.commission_amount || 0) > 0) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bonuses</span>
                    <span className="font-medium text-gray-950">{Number(payslip.bonus_amount || 0).toFixed(2)} MAD</span>
                  </div>
                )}
                {(Number(payslip.transportation_allowance || 0) > 0 || Number(payslip.housing_allowance || 0) > 0 || Number(payslip.other_allowances || 0) > 0) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Allowances</span>
                    <span className="font-medium text-gray-950">
                      {Number(payslip.transportation_allowance || 0) + Number(payslip.housing_allowance || 0) + Number(payslip.other_allowances || 0)} MAD
                    </span>
                  </div>
                )}
                {(Number(payslip.overtime_amount || 0) > 0) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Overtime ({payslip.overtime_hours || 0}h)</span>
                    <span className="font-medium text-gray-950">{Number(payslip.overtime_amount || 0).toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>GROSS SALARY</span>
                  <span className="font-semibold text-blue-600">{Number(payslip.gross_salary || 0).toFixed(2)} MAD</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">DEDUCTIONS</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">CNSS</span>
                  <span className="font-medium text-red-600">-{Number(payslip.cnss_employee || 0).toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AMO</span>
                  <span className="font-medium text-red-600">-{Number(payslip.amo_employee || 0).toFixed(2)} MAD</span>
                </div>
                {payslip.cimr_employee && Number(payslip.cimr_employee || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">CIMR</span>
                    <span className="font-medium text-red-600">-{Number(payslip.cimr_employee || 0).toFixed(2)} MAD</span>
                  </div>
                )}
                {(Number(payslip.income_tax || 0) > 0) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">IR (Income Tax)</span>
                    <span className="font-medium text-red-600">-{Number(payslip.income_tax || 0).toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                  <span>TOTAL DEDUCTIONS</span>
                  <span className="text-red-600">-{Number(payslip.total_deductions || 0).toFixed(2)} MAD</span>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100 text-sm mb-1">NET SALARY TO PAY</p>
                  <p className="text-3xl font-bold">{Number(payslip.net_salary || 0).toFixed(2)} MAD</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-xs">Employer Cost</p>
                  <p className="text-lg font-semibold">{Number(payslip.total_cost || 0).toFixed(2)} MAD</p>
                </div>
              </div>
            </div>

            {/* Print buttons */}
            <div className="flex gap-3 pt-4 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailModal;

