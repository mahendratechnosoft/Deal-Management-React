import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const RoleBasedRoute = lazy(() =>
  import("../Components/BaseComponet/RoleBasedRoute")
);
const EmployeeList = lazy(() =>
  import("../Components/Common/Employee/EmployeeList")
);
const EditEmployee = lazy(() =>
  import("../Components/Common/Employee/EditEmployee")
);
const LeadList = lazy(() => import("../Components/Common/Lead/LeadList"));
const CreateLead = lazy(() => import("../Components/Common/Lead/CreateLead"));
const EditLead = lazy(() => import("../Components/Common/Lead/EditLead"));
const CustomerList = lazy(() =>
  import("../Components/Common/Customer/CustomerList")
);
const CreateCustomer = lazy(() =>
  import("../Components/Common/Customer/CreateCustomer")
);
const EditCustomer = lazy(() =>
  import("../Components/Common/Customer/EditCustomer")
);
const PaymentList = lazy(() =>
  import("../Components/Common/Payment/PaymentList")
);
const EditPayment = lazy(() =>
  import("../Components/Common/Payment/EditPayment")
);
const PaymentPreview = lazy(() =>
  import("../Components/Common/Payment/PaymentPreview")
);
const DonorList = lazy(() => import("../Components/Common/Donor/DonorList"));
const EditDonar = lazy(() => import("../Components/Common/Donor/EditDonar"));
const SelectedDonarList = lazy(() =>
  import("../Components/Common/Donor/SelectedDonarList")
);
const FamilyList = lazy(() => import("../Components/Common/Donor/FamilyList"));
const EditFamily = lazy(() => import("../Components/Common/Donor/EditFamily"));
const DonorMatchingFilter = lazy(() =>
  import("../Components/Common/Donor/DonorMatchingFilter")
);
const SemenEnquiryList = lazy(() =>
  import("../Components/Common/Donor/SemenEnquiryList")
);
const EditSemenEnquiry = lazy(() =>
  import("../Components/Common/Donor/EditSemenEnquiry")
);
const ProposalList = lazy(() =>
  import("../Components/Common/Proposal/ProposalList")
);
const CreateProposal = lazy(() =>
  import("../Components/Common/Proposal/CreateProposal")
);
const EditProposal = lazy(() =>
  import("../Components/Common/Proposal/EditProposal")
);
const ProposalPreview = lazy(() =>
  import("../Components/Common/Proposal/ProposalPreview")
);
const ProformaList = lazy(() =>
  import("../Components/Common/Proforma/ProformaList")
);
const CreateProforma = lazy(() =>
  import("../Components/Common/Proforma/CreateProforma")
);
const EditProforma = lazy(() =>
  import("../Components/Common/Proforma/EditProforma")
);
const ProformaPreview = lazy(() =>
  import("../Components/Common/Proforma/ProformaPreview")
);
const InvoiceList = lazy(() =>
  import("../Components/Common/Invoice/InvoiceList")
);
const InvoicePreview = lazy(() =>
  import("../Components/Common/Invoice/InvoicePreview")
);
const TimeSheetList = lazy(() =>
  import("../Components/Common/Timesheet/TimeSheetList")
);
const TaskList = lazy(() => import("../Components/Common/Task/TaskList"));
const AmcList = lazy(() => import("../Components/Common/AMC/AmcList"));
const VendorList = lazy(() => import("../Components/Common/Vendor/VendorList"));
const VendorContactList = lazy(() =>
  import("../Components/Common/Vendor/VendorContact/VendorContactList")
);
const ItemList = lazy(() => import("../Components/Common/Item/Itemlists"));
const ComplianceList = lazy(() =>
  import("../Components/Common/ContactPannel/Compliance/ComplianceList")
);
const AdminLayout = lazy(() => import("../Components/Layout/AdminLayout"));
const SettingsLayout = lazy(() =>
  import("../Components/Layout/Admin/SettingsLayout")
);
const General = lazy(() => import("../Components/Common/Settings/General"));
const Department = lazy(() =>
  import("../Components/Common/Settings/RoleAndDepartment/Department")
);
const RoleListCompo = lazy(() =>
  import("../Components/Common/Settings/RoleAndDepartment/RoleListCompo")
);
const PaymentModeList = lazy(() =>
  import("../Components/Common/Settings/Finance/PaymentMode/PaymentModeList")
);
const EmailSetting = lazy(() =>
  import("../Components/Common/Settings/EmailSetting")
);
const ProposalSetting = lazy(() =>
  import("../Components/Common/Settings/Finance/ProposalSetting")
);
const ProformaSetting = lazy(() =>
  import("../Components/Common/Settings/Finance/ProformaSetting")
);
const InvoiceSetting = lazy(() =>
  import("../Components/Common/Settings/Finance/InvoiceSetting")
);
const VendorSetting = lazy(() =>
  import("../Components/Common/Settings/Finance/VendorSetting")
);
const DynamicFormBase = lazy(() =>
  import("../Components/Common/Settings/DynamicForm/DynamicFormBase")
);

const EmailTemplateTask = lazy(() =>
  import("../Components/Common/Settings/Template/Email/TaskTemplateList")
);

const EmailTemplateSales = lazy(() =>
  import("../Components/Common/Settings/Template/Email/SalesTemplateList")
);

const AdminRoutes = () => {
  return (
    <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="LeadList" element={<LeadList />} />
          <Route path="CreateLead" element={<CreateLead />} />
          <Route path="EmployeeList" element={<EmployeeList />} />
          <Route path="EditEmployee/:employeeId" element={<EditEmployee />} />
          <Route path="EditLead/:id" element={<EditLead />} />
          <Route path="CustomerList" element={<CustomerList />} />
          <Route path="CreateCustomer" element={<CreateCustomer />} />
          <Route path="EditCustomer/:customerId" element={<EditCustomer />} />
          <Route path="Payment" element={<PaymentList />} />
          <Route path="EditPayment/:paymentId" element={<EditPayment />} />
          <Route path="ViewPayment/:paymentId" element={<PaymentPreview />} />
          <Route path="DonorList" element={<DonorList />} />
          <Route path="DonorEdit/:donorId" element={<EditDonar />} />
          <Route path="DonorList/:pageName" element={<SelectedDonarList />} />
          <Route path="FamilyList" element={<FamilyList />} />
          <Route
            path="PreviewMatchingDonors/:familyId"
            element={<DonorMatchingFilter />}
          />
          <Route path="EditFamily/:familyInfoId" element={<EditFamily />} />
          <Route path="Proposal" element={<ProposalList />} />
          <Route path="Proposal/Create" element={<CreateProposal />} />
          <Route path="Proposal/Edit/:proposalId" element={<EditProposal />} />
          <Route
            path="Proposal/Preview/:proposalId"
            element={<ProposalPreview />}
          />
          <Route path="Proforma" element={<ProformaList />} />
          <Route path="Proforma/Create" element={<CreateProforma />} />
          <Route
            path="Proforma/Edit/:proformaInvoiceId"
            element={<EditProforma />}
          />
          <Route
            path="Proforma/Preview/:proformaInvoiceId"
            element={<ProformaPreview />}
          />
          <Route path="TimesheetList" element={<TimeSheetList />} />
          <Route path="Invoice" element={<InvoiceList />} />
          <Route path="ItemList" element={<ItemList />} />
          <Route
            path="Invoice/Preview/:proformaInvoiceId"
            element={<InvoicePreview />}
          />
          <Route path="TaskList" element={<TaskList />} />
          <Route path="AMC" element={<AmcList />} />
          <Route
            path="VendorContactList/:vendorId"
            element={<VendorContactList />}
          />
          <Route path="VendorList" element={<VendorList />} />
          <Route path="SemenEnquiryList" element={<SemenEnquiryList />} />
          <Route path="EditSemenEnquiry/:id" element={<EditSemenEnquiry />} />
          <Route path="ComplianceList" element={<ComplianceList />} />

          {/* ------------Settings--------------- */}

          <Route path="Settings" element={<SettingsLayout />}>
            <Route index element={<General />} />
            <Route path="Email" element={<EmailSetting />} />
            <Route path="Department" element={<Department />} />

            <Route
              path="Department/:departmentId/Roles"
              element={<RoleListCompo />}
            />
            <Route path="Finance">
              <Route path="PaymentMode" element={<PaymentModeList />} />
              <Route path="Proposal" element={<ProposalSetting />} />
              <Route path="Proforma" element={<ProformaSetting />} />
              <Route path="Invoice" element={<InvoiceSetting />} />
              <Route path="Vendor" element={<VendorSetting />} />
            </Route>

            <Route path="Form" element={<DynamicFormBase />} />

            <Route path="EmailTemplate">
              <Route path="Task" element={<EmailTemplateTask />} />
              <Route path="Sales" element={<EmailTemplateSales />} />
            </Route>
          </Route>

          {/* ------------Settings END--------------- */}
        </Route>
      </Routes>
    </RoleBasedRoute>
  );
};

export default AdminRoutes;
