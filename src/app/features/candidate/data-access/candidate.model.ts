import { DepartmentModel } from '../../categories/department/data-access/department.model';
import { JobTitleModel } from '../../categories/job-title/data-access/job-title.model';
import { Gender } from '../../employee/data-access/employee.enum';
import { CandidateStage } from './candidate.enum';

export interface CandidateModel {
  id: string;
  candidateCode?: string | null;
  candidateName: string;
  gender?: Gender | string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  department?: DepartmentModel | null;
  jobTitleId?: string | null;
  jobTitleName?: string | null;
  jobTitle?: JobTitleModel | null;
  storeId?: string | null;
  storeName?: string | null;
  photo?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  workLocation?: string | null;
  stage?: CandidateStage | string | null;
  appliedDate?: Date | string | null;
  expectedSalary?: number | null;
  experienceYears?: number | null;
  matchScore?: number | null;
  skills?: string | null;
  fileAttach?: string | null;
  interviewerNote?: string | null;
  isBookmarked?: boolean | null;
  isDelete?: boolean | null;

  note?: string | null;
  createdAt?: Date | null;
  createdBy?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export const CandidateFields: Record<keyof CandidateModel, string> = {
  id: 'Id',
  candidateCode: 'CandidateCode',
  candidateName: 'CandidateName',
  gender: 'Gender',
  departmentId: 'DepartmentId',
  departmentName: 'DepartmentName',
  department: 'Department',
  jobTitleId: 'JobTitleId',
  jobTitleName: 'JobTitleName',
  jobTitle: 'JobTitle',
  storeId: 'StoreId',
  storeName: 'StoreName',
  photo: 'Photo',
  email: 'Email',
  phoneNumber: 'PhoneNumber',
  workLocation: 'WorkLocation',
  stage: 'Stage',
  appliedDate: 'AppliedDate',
  expectedSalary: 'ExpectedSalary',
  experienceYears: 'ExperienceYears',
  matchScore: 'MatchScore',
  skills: 'Skills',
  fileAttach: 'FileAttach',
  interviewerNote: 'InterviewerNote',
  isBookmarked: 'IsBookmarked',
  isDelete: 'IsDelete',

  note: 'Note',
  createdAt: 'CreatedAt',
  createdBy: 'CreatedBy',
  updatedAt: 'UpdatedAt',
  updatedBy: 'UpdatedBy',
};
