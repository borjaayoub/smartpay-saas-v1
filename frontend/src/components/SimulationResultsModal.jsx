import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Calculator, Save } from 'lucide-react';
import { usePayslipMutations } from '../hooks/usePayslips';
import { api } from '../lib/fetcher';
import useToastStore from '../store/toastStore';

const SimulationResultsModal = ({ 
  isOpen, 
  onClose, 
  simulationResult, 
  bulkResult, 
  bulkMode, 
  formatCurrency 
}) => {
  const [month, setMonth] = useState('');
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const { createPayslip } = usePayslipMutations();
  const toast = useToastStore();

  // Fetch company_id on mount
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get('/companies');
        if (response.data?.companies && response.data.companies.length > 0) {
          setCompanyId(response.data.companies[0].id);
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    };
    fetchCompany();
  }, []);

  // Generate current month as default
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Set default month when modal opens
  React.useEffect(() => {
    if (isOpen && !month) {
      setMonth(getCurrentMonth());
    }
  }, [isOpen, month]);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    // Create a new window with the results content for PDF generation
    const printWindow = window.open('', '_blank');
    const content = document.getElementById('simulation-results-content');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Payroll Simulation Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .employee-info { background-color: #f9f9f9; }
            .deductions { background-color: #fef2f2; }
            .net-salary { background-color: #f0fdf4; }
            .employer-costs { background-color: #eff6ff; }
            .summary { background-color: #eff6ff; }
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

  const handleSavePayslip = async () => {
    if (!month) {
      toast.error('Please select a month for the payslip', 'Month Required');
      return;
    }

    if (!companyId) {
      toast.error('Company information is missing. Please contact support.', 'Company Required');
      return;
    }

    // Convert date to pay period dates
    const date = new Date(month);
    const year = date.getFullYear();
    const monthNum = date.getMonth() + 1;
    
    // Calculate pay period start (first day of month)
    const payPeriodStart = `${year}-${String(monthNum).padStart(2, '0')}-01`;
    
    // Calculate pay period end (last day of month)
    const lastDay = new Date(year, monthNum, 0).getDate();
    const payPeriodEnd = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    setSaving(true);
    try {
      if (bulkMode && bulkResult) {
        // Save multiple payslips for bulk simulation
        if (!bulkResult.results || bulkResult.results.length === 0) {
          toast.error('No simulation results to save', 'Nothing to Save');
          setSaving(false);
          return;
        }

        const promises = bulkResult.results
          .filter(result => result.simulation && !result.error)
          .map(result => {
            const sim = result.simulation;
            const inputs = sim.inputs || {};
            
            return createPayslip({
              employee_id: result.employee_id,
              company_id: companyId,
              pay_period_start: payPeriodStart,
              pay_period_end: payPeriodEnd,
              pay_month: monthNum,
              pay_year: year,
              base_salary: parseFloat(inputs.gross_salary || 0),
              gross_salary: parseFloat(sim.gross_with_overtime || 0),
              net_salary: parseFloat(sim.net_salary || 0),
              total_cost: parseFloat((sim.employer_contributions?.total || 0) + (sim.gross_with_overtime || 0)),
              overtime_hours: parseFloat(inputs.overtime_hours || 0),
              overtime_rate: parseFloat(inputs.overtime_rate || 0),
              overtime_amount: parseFloat(sim.overtime_amount || 0),
              bonus_amount: parseFloat(inputs.bonuses || 0),
              other_allowances: parseFloat(inputs.allowances || 0),
              cnss_employee: parseFloat(sim.employee_contributions?.cnss_employee || 0),
              cnss_employer: parseFloat(sim.employer_contributions?.cnss_employer || 0),
              amo_employee: parseFloat(sim.employee_contributions?.amo_employee || 0),
              amo_employer: parseFloat(sim.employer_contributions?.amo_employer || 0),
              cimr_employee: sim.employee_contributions?.cimr_employee ? parseFloat(sim.employee_contributions.cimr_employee) : null,
              cimr_employer: sim.employer_contributions?.cimr_employer ? parseFloat(sim.employer_contributions.cimr_employer) : null,
              income_tax: parseFloat(sim.employee_contributions?.igr || 0),
              other_deduction: {},
              total_deductions: parseFloat(sim.employee_contributions?.total || 0),
              status: 'pending'
            });
          });
        
        await Promise.all(promises);
        toast.success(`Successfully saved ${promises.length} payslips!`, 'Payslips Saved');
      } else if (simulationResult) {
        // Save single payslip
        const inputs = simulationResult.inputs || {};
        
        if (!inputs.employee_id) {
          toast.error('Employee information is missing. Cannot save payslip.', 'Employee Required');
          setSaving(false);
          return;
        }
        
        await createPayslip({
          employee_id: inputs.employee_id,
          company_id: companyId,
          pay_period_start: payPeriodStart,
          pay_period_end: payPeriodEnd,
          pay_month: monthNum,
          pay_year: year,
          base_salary: parseFloat(inputs.gross_salary || 0),
          gross_salary: parseFloat(simulationResult.gross_with_overtime || 0),
          net_salary: parseFloat(simulationResult.net_salary || 0),
          total_cost: parseFloat((simulationResult.employer_contributions?.total || 0) + (simulationResult.gross_with_overtime || 0)),
          overtime_hours: parseFloat(inputs.overtime_hours || 0),
          overtime_rate: parseFloat(inputs.overtime_rate || 0),
          overtime_amount: parseFloat(simulationResult.overtime_amount || 0),
          bonus_amount: parseFloat(inputs.bonuses || 0),
          other_allowances: parseFloat(inputs.allowances || 0),
          cnss_employee: parseFloat(simulationResult.employee_contributions?.cnss_employee || 0),
          cnss_employer: parseFloat(simulationResult.employer_contributions?.cnss_employer || 0),
          amo_employee: parseFloat(simulationResult.employee_contributions?.amo_employee || 0),
          amo_employer: parseFloat(simulationResult.employer_contributions?.amo_employer || 0),
          cimr_employee: simulationResult.employee_contributions?.cimr_employee ? parseFloat(simulationResult.employee_contributions.cimr_employee) : null,
          cimr_employer: simulationResult.employer_contributions?.cimr_employer ? parseFloat(simulationResult.employer_contributions.cimr_employer) : null,
          income_tax: parseFloat(simulationResult.employee_contributions?.igr || 0),
          other_deduction: {},
          total_deductions: parseFloat(simulationResult.employee_contributions?.total || 0),
          status: 'pending'
        });
      }
    } catch (error) {
      console.error('Error saving payslip:', error);
      toast.error(
        error.response?.data?.error || 'Failed to save payslip. Please try again.',
        'Save Failed'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {bulkMode ? 'Bulk Payroll Simulation Results' : 'Payroll Simulation Results'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePayslip}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save to Payslips'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Month Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payslip Month
            </label>
            <input
              type="date"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Select the month for which this payslip will be generated
            </p>
          </div>
          
          <div id="simulation-results-content">
            {simulationResult && !bulkMode && (
              <div className="space-y-4">
                {/* Employee Info - Optional, only if employee data is provided */}
                {simulationResult.employee && (
                  <div className="bg-gray-50 rounded-lg p-4 employee-info">
                    <h3 className="font-medium text-gray-900 mb-2">Employee Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">{simulationResult.employee?.name || simulationResult.employee?.first_name + ' ' + simulationResult.employee?.last_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Position:</span>
                        <p className="font-medium">{simulationResult.employee?.position || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Department:</span>
                        <p className="font-medium">{simulationResult.employee?.department || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Employee ID:</span>
                        <p className="font-medium">{simulationResult.inputs?.employee_id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Salary Breakdown */}
                <div className="section">
                  <h3 className="font-medium text-gray-900 mb-3">Salary Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Base Salary:</span>
                      <span className="font-medium">{formatCurrency(simulationResult.inputs?.gross_salary || 0)}</span>
                    </div>
                    
                    {(simulationResult.inputs?.overtime_hours || 0) > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Overtime ({simulationResult.inputs.overtime_hours}h @ {simulationResult.inputs.overtime_rate}x):</span>
                        <span className="font-medium">{formatCurrency(simulationResult.overtime_amount || 0)}</span>
                      </div>
                    )}
                    
                    {(simulationResult.inputs?.bonuses || 0) > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Bonuses:</span>
                        <span className="font-medium">{formatCurrency(simulationResult.inputs.bonuses || 0)}</span>
                      </div>
                    )}
                    
                    {(simulationResult.inputs?.allowances || 0) > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Allowances:</span>
                        <span className="font-medium">{formatCurrency(simulationResult.inputs.allowances || 0)}</span>
                      </div>
                    )}
                    
                    {(simulationResult.inputs?.deductions || 0) > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Other Deductions:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(simulationResult.inputs.deductions || 0)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2 border-b-2 border-gray-300">
                      <span className="font-semibold text-gray-900">Gross Salary (with overtime):</span>
                      <span className="font-bold text-lg">{formatCurrency(simulationResult.gross_with_overtime || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-red-50 rounded-lg p-4 deductions">
                  <h3 className="font-medium text-red-800 text-md mb-3">Withholdings</h3>
                  <div className="space-y-2">
                    {simulationResult.rates && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700 text-sm">CNSS Employee ({simulationResult.rates.cnss_employee || 0}%):</span>
                          <span className="font-medium text-red-600">{formatCurrency(simulationResult.employee_contributions?.cnss_employee || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700 text-sm">AMO Employee ({simulationResult.rates.amo_employee || 0}%):</span>
                          <span className="font-medium text-red-600">{formatCurrency(simulationResult.employee_contributions?.amo_employee || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700 text-sm">CIMR Employee ({simulationResult.rates.cimr_employee || 0}%):</span>
                          <span className="font-medium text-red-600">{formatCurrency(simulationResult.employee_contributions?.cimr_employee || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700 text-sm">IGR:</span>
                          <span className="font-medium text-red-600">{formatCurrency(simulationResult.employee_contributions?.igr || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-700 text-sm">Professional Tax ({simulationResult.rates.professional_tax || 0}%):</span>
                          <span className="font-medium text-red-600">{formatCurrency(simulationResult.employee_contributions?.professional_tax || 0)}</span>
                        </div>
                        {(simulationResult.employee_contributions?.other || 0) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-red-700 text-sm">Other Deductions:</span>
                            <span className="font-medium text-red-600">{formatCurrency(simulationResult.employee_contributions.other || 0)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between items-center border-t border-red-200 pt-2">
                      <span className="font-semibold text-red-600">Total Withholdings:</span>
                      <span className="font-bold text-red-600">{formatCurrency(simulationResult.employee_contributions?.total || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-green-50 rounded-lg p-4 net-salary">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-600">Net Salary:</span>
                    <span className="font-bold text-xl text-green-600">{formatCurrency(simulationResult.net_salary || 0)}</span>
                  </div>
                </div>

                {/* Employer Costs */}
                <div className="bg-blue-50 rounded-lg p-4 employer-costs">
                  <h3 className="font-medium text-blue-800 mb-3">Employer Costs</h3>
                  <div className="space-y-2">
                    {simulationResult.rates && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-600 text-sm">CNSS Employer ({simulationResult.rates.cnss_employer || 0}%):</span>
                          <span className="font-medium text-blue-600">{formatCurrency(simulationResult.employer_contributions?.cnss_employer || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-600 text-sm">AMO Employer ({simulationResult.rates.amo_employer || 0}%):</span>
                          <span className="font-medium text-blue-600">{formatCurrency(simulationResult.employer_contributions?.amo_employer || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-600 text-sm">CIMR Employer ({simulationResult.rates.cimr_employer || 0}%):</span>
                          <span className="font-medium text-blue-600">{formatCurrency(simulationResult.employer_contributions?.cimr_employer || 0)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                      <span className="font-semibold text-blue-600">Total Cost to Employer:</span>
                      <span className="font-bold text-blue-600">{formatCurrency((simulationResult.employer_contributions?.total || 0) + (simulationResult.gross_with_overtime || simulationResult.inputs?.gross_salary || 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {bulkResult && bulkMode && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-blue-50 rounded-lg p-4 summary">
                  <h3 className="font-medium text-blue-900 mb-3">Bulk Simulation Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Total Employees:</span>
                      <p className="font-medium text-blue-900">{bulkResult.total || 0}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Successful:</span>
                      <p className="font-medium text-green-600">{bulkResult.successful || 0}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Failed:</span>
                      <p className="font-medium text-red-600">{bulkResult.failed || 0}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Total Cost (all employees):</span>
                      <p className="font-medium text-blue-900">{formatCurrency(
                        bulkResult.results?.reduce((sum, r) => 
                          sum + (r.simulation?.employer_contributions?.total || 0) + (r.simulation?.gross_with_overtime || 0), 0
                        ) || 0
                      )}</p>
                    </div>
                  </div>
                </div>

                {/* Individual Results */}
                <div className="max-h-96 overflow-y-auto">
                  <h3 className="font-medium text-gray-900 mb-3">Individual Results</h3>
                  {bulkResult.results && bulkResult.results.length > 0 ? (
                    bulkResult.results.map((result, index) => {
                      const sim = result.simulation;
                      if (!sim) return null;
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">Employee ID: {result.employee_id}</h4>
                              <p className="text-sm text-gray-600">Gross: {formatCurrency(sim.gross_with_overtime || 0)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{formatCurrency(sim.net_salary || 0)}</p>
                              <p className="text-sm text-gray-600">Net Salary</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                            <div>
                              <span className="text-gray-600">Deductions:</span>
                              <p className="font-medium">{formatCurrency(sim.employee_contributions?.total || 0)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Employer Cost:</span>
                              <p className="font-medium">{formatCurrency(sim.employer_contributions?.total || 0)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Total Cost:</span>
                              <p className="font-medium">{formatCurrency((sim.employer_contributions?.total || 0) + (sim.gross_with_overtime || 0))}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-4">No results available</p>
                  )}
                  
                  {/* Show errors if any */}
                  {bulkResult.errors && bulkResult.errors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                      {bulkResult.errors.map((error, index) => (
                        <div key={index} className="text-red-600 text-sm mb-1">
                          Employee {error.employee_id}: {error.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationResultsModal;
