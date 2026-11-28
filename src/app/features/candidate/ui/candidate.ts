import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  linkedSignal,
  signal,
  TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { BASE_CONSTANTS } from '../../../core/constants/base.constant';
import { FilterOperator, FilterType } from '../../../core/constants/filter.enum';
import { PERMISSIONS } from '../../../core/constants/permission.constant';
import { PagingRequest } from '../../../core/models/paging.model';
import { AuthService } from '../../../core/services/auth.service';
import { BaseService } from '../../../core/services/base.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { Export } from '../../../shared/components/export/export';
import { Import } from '../../../shared/components/import/import';
import {
  EXPORT_MODAL_CONTEXT,
  IMPORT_MODAL_CONTEXT,
} from '../../../shared/components/modal/modal-context';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Summary } from '../../../shared/components/summary/summary';
import { Table } from '../../../shared/components/table/table';
import { Toolbar } from '../../../shared/components/toolbar/toolbar';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { EmptyFallbackPipe } from '../../../shared/pipes/empty-fallback.pipe';
import { MaskPipe } from '../../../shared/pipes/mask.pipe';
import { DepartmentFacade } from '../../categories/department/data-access/department.facade';
import { DepartmentModel } from '../../categories/department/data-access/department.model';
import { JobTitleFacade } from '../../categories/job-title/data-access/job-title.facade';
import { JobTitleModel } from '../../categories/job-title/data-access/job-title.model';
import { Gender, GENDER_CONFIG, GENDER_OPTIONS } from '../../employee/data-access/employee.enum';
import {
  CANDIDATE_STAGE_CONFIG,
  CANDIDATE_STAGE_OPTIONS,
  CandidateStage,
  CandidateStageColumnConfig,
  MATCH_SCORE_LEVEL_CONFIG,
  MATCH_SCORE_LEVEL_OPTIONS,
  MatchScoreLevel,
} from '../data-access/candidate.enum';
import { CandidateFacade } from '../data-access/candidate.facade';
import { CandidateFields, CandidateModel } from '../data-access/candidate.model';
import { CandidateModal } from './editor-modal/candidate-modal';

interface PipelineStageGroup {
  stage: CandidateStage;
  config: CandidateStageColumnConfig;
  allItems: CandidateModel[];
  visibleItems: CandidateModel[];
  totalCount: number;
  moreCount: number;
}

const KANBAN_INITIAL_LIMIT = 3;

@Component({
  selector: 'app-candidate',
  imports: [
    Pagination,
    Summary,
    Toolbar,
    Table,
    DatePipe,
    FormsModule,
    TranslatePipe,
    EmptyFallbackPipe,
    CurrencyFormatPipe,
    MaskPipe,
  ],
  templateUrl: './candidate.html',
  styleUrl: './candidate.scss',
})
export class Candidate {
  private readonly facade = inject(CandidateFacade);
  private readonly departmentFacade = inject(DepartmentFacade);
  private readonly jobTitleFacade = inject(JobTitleFacade);
  private readonly modal = inject(NgbModal);
  private readonly injector = inject(Injector);
  private readonly dialogService = inject(DialogService);
  private readonly baseService = inject(BaseService);
  protected readonly authService = inject(AuthService);
  protected readonly permissions = PERMISSIONS.candidate;

  private stageModalRef: NgbModalRef | null = null;

  //#region //@ PROPS

  readonly Gender = Gender;
  readonly CandidateStage = CandidateStage;
  readonly stages = CANDIDATE_STAGE_OPTIONS;
  readonly stageConfig = CANDIDATE_STAGE_CONFIG;
  readonly matchLevels = MATCH_SCORE_LEVEL_OPTIONS;
  readonly matchLevelConfig = MATCH_SCORE_LEVEL_CONFIG;
  readonly genders = GENDER_OPTIONS;
  readonly genderConfig = GENDER_CONFIG;

  readonly stageOrder: CandidateStage[] = [
    CandidateStage.Applied,
    CandidateStage.Screening,
    CandidateStage.Interview,
    CandidateStage.Offer,
    CandidateStage.Hired,
    CandidateStage.Rejected,
  ];

  readonly candidateColumns = Object.keys(CandidateFields).filter(
    (key) =>
      key !== 'id' &&
      key !== 'departmentId' &&
      key !== 'department' &&
      key !== 'jobTitleId' &&
      key !== 'jobTitle' &&
      key !== 'storeId' &&
      key !== 'isBookmarked' &&
      key !== 'isDelete' &&
      key !== 'note' &&
      key !== 'createdAt' &&
      key !== 'createdBy' &&
      key !== 'updatedAt' &&
      key !== 'updatedBy',
  );

  //#endregion

  //#region //@ STATE

  readonly pageSize = signal(20);
  readonly fromRecord = signal(1);
  readonly toRecord = signal(20);
  readonly recordRange = signal('');
  readonly totalRecord = signal(0);
  readonly pageCount = signal(0);
  readonly candidates = signal<CandidateModel[]>([]);
  readonly departments = signal<DepartmentModel[]>([]);
  readonly jobTitles = signal<JobTitleModel[]>([]);
  readonly searchText = signal('');
  readonly filterDepartmentId = signal('');
  readonly filterJobTitleId = signal('');
  readonly filterStage = signal('');
  readonly filterMatchLevel = signal('');
  readonly filterGender = signal('');
  readonly filterIsDelete = signal(false);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly isLoading = signal(false);
  readonly isKanbanView = signal(true);

  readonly draggedCandidateId = signal<string | null>(null);
  readonly dragOverStage = signal<string | null>(null);

  readonly detailCandidate = signal<CandidateModel | null>(null);
  readonly activeStageModalStage = signal<CandidateStage>(CandidateStage.Applied);
  readonly stageModalSearchText = signal('');

  readonly pageIndex = linkedSignal({
    source: () => ({
      search: this.searchText(),
      departmentId: this.filterDepartmentId(),
      jobTitleId: this.filterJobTitleId(),
      stage: this.filterStage(),
      matchLevel: this.filterMatchLevel(),
      gender: this.filterGender(),
      isDelete: this.filterIsDelete(),
      isKanbanView: this.isKanbanView(),
      pageSize: this.pageSize(),
    }),
    computation: () => 1,
  });

  //* computed() dùng để tính toán giá trị dựa trên state khác
  readonly isSelectedAll = computed(() => {
    const list = this.candidates();
    const ids = this.selectedIds();
    return list.length > 0 && list.every((item) => ids.has(item.id));
  });

  readonly departmentMap = computed(() => {
    const map = new Map<string, string>();
    for (const dept of this.departments()) {
      map.set(dept.id, dept.departmentName);
    }
    return map;
  });

  readonly jobTitleMap = computed(() => {
    const map = new Map<string, string>();
    for (const job of this.jobTitles()) {
      map.set(job.id, job.jobTitleName);
    }
    return map;
  });

  readonly pipelineColumns = computed<PipelineStageGroup[]>(() => {
    const list = this.candidates();

    return this.stageOrder.map((stage) => {
      const config = this.stageConfig[stage];
      const stageItems = list.filter((item) => this.normalizeStage(item.stage) === stage);
      const visibleItems = stageItems.slice(0, KANBAN_INITIAL_LIMIT);
      const moreCount = Math.max(0, stageItems.length - KANBAN_INITIAL_LIMIT);

      return {
        stage,
        config,
        allItems: stageItems,
        visibleItems,
        totalCount: stageItems.length,
        moreCount,
      };
    });
  });

  readonly activeStageCandidates = computed<CandidateModel[]>(() => {
    const targetStage = this.activeStageModalStage();
    const query = this.stageModalSearchText().toLowerCase().trim();
    const stageItems = this.candidates().filter(
      (item) => this.normalizeStage(item.stage) === targetStage,
    );

    if (!query) return stageItems;

    return stageItems.filter((item) => {
      const name = (item.candidateName || '').toLowerCase();
      const code = (item.candidateCode || '').toLowerCase();
      const dept = this.getDepartmentName(item).toLowerCase();
      const role = this.getJobTitleName(item).toLowerCase();
      return (
        name.includes(query) || code.includes(query) || dept.includes(query) || role.includes(query)
      );
    });
  });

  //#endregion

  constructor() {
    this.loadComboboxData();
    effect(() => {
      this.loadListData();
    });
  }

  //#region //@ HELPERS

  private async loadComboboxData() {
    const [deptResult, jobResult] = await Promise.allSettled([
      this.departmentFacade.getPaging({ allowPaging: false }),
      this.jobTitleFacade.getPaging({ allowPaging: false }),
    ]);

    if (deptResult.status === BASE_CONSTANTS.promiseFulfilled) {
      this.departments.set(deptResult.value.result?.items || []);
    } else {
      this.departments.set([]);
    }

    if (jobResult.status === BASE_CONSTANTS.promiseFulfilled) {
      this.jobTitles.set(jobResult.value.result?.items || []);
    } else {
      this.jobTitles.set([]);
    }
  }

  private buildFilter(): PagingRequest {
    const isKanban = this.isKanbanView();
    const filter: PagingRequest = {
      allowPaging: !isKanban,
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    };

    const filterText = this.searchText().trim();
    const filterIsDeleted = this.filterIsDelete();
    const filterDepartment = this.filterDepartmentId();
    const filterJobTitle = this.filterJobTitleId();
    const filterStage = this.filterStage().trim();
    const filterMatch = this.filterMatchLevel().trim();
    const filterGender = this.filterGender().trim();

    filter.filters = [];

    filter.filters.push({
      filterName: BASE_CONSTANTS.isDelete,
      filterValue: filterIsDeleted.toString(),
      filterType: FilterType.boolean,
    });

    if (filterText) {
      filter.filters.push({
        filterName: `${CandidateFields.candidateCode},${CandidateFields.candidateName}`,
        filterValue: filterText,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });
    }

    if (filterDepartment) {
      filter.filters.push({
        filterName: CandidateFields.departmentId,
        filterValue: filterDepartment,
        filterType: FilterType.guid,
        filterOperator: FilterOperator.contains,
      });
    }

    if (filterJobTitle) {
      filter.filters.push({
        filterName: CandidateFields.jobTitleId,
        filterValue: filterJobTitle,
        filterType: FilterType.guid,
        filterOperator: FilterOperator.contains,
      });
    }

    if (filterStage) {
      filter.filters.push({
        filterName: CandidateFields.stage,
        filterValue: filterStage,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });
    }

    if (filterGender) {
      filter.filters.push({
        filterName: CandidateFields.gender,
        filterValue: filterGender,
        filterType: FilterType.string,
        filterOperator: FilterOperator.like,
      });
    }

    if (filterMatch === MatchScoreLevel.High) {
      filter.filters.push({
        filterName: CandidateFields.matchScore,
        filterValue: '80',
        filterType: FilterType.number,
        filterOperator: FilterOperator.greaterOrEqual,
      });
    } else if (filterMatch === MatchScoreLevel.Medium) {
      filter.filters.push({
        filterName: CandidateFields.matchScore,
        filterValue: '70,79',
        filterType: FilterType.number,
        filterOperator: FilterOperator.between,
      });
    } else if (filterMatch === MatchScoreLevel.Fair) {
      filter.filters.push({
        filterName: CandidateFields.matchScore,
        filterValue: '70',
        filterType: FilterType.number,
        filterOperator: FilterOperator.lessThan,
      });
    }

    return filter;
  }

  normalizeStage(stage?: string | null): CandidateStage {
    if (!stage) return CandidateStage.Applied;

    const normalized = stage.trim().toLowerCase();
    for (const val of this.stageOrder) {
      if (val.toLowerCase() === normalized) return val;
    }

    return CandidateStage.Applied;
  }

  getDepartmentName(item: CandidateModel): string {
    return (
      item.departmentName ||
      item.department?.departmentName ||
      (item.departmentId ? this.departmentMap().get(item.departmentId) : '') ||
      ''
    );
  }

  getJobTitleName(item: CandidateModel): string {
    return (
      item.jobTitleName ||
      item.jobTitle?.jobTitleName ||
      (item.jobTitleId ? this.jobTitleMap().get(item.jobTitleId) : '') ||
      ''
    );
  }

  getMatchScoreClass(score?: number | null): string {
    if (score == null) return 'match-medium';
    if (score >= 80) return 'match-high';
    if (score >= 70) return 'match-medium';
    return 'match-fair';
  }

  getSkillsList(skills?: string | null): string[] {
    if (!skills) return [];
    return skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  //#endregion

  //#region //@ METHODS

  async loadListData() {
    this.isLoading.set(true);
    const filter = this.buildFilter();

    try {
      //* Chạy song song cả API và timer tối thiểu 300ms
      const [res] = await Promise.all([this.facade.getPaging(filter), this.baseService.delay(300)]);

      this.candidates.set(res.result?.items || []);
      this.totalRecord.set(res.result?.totalRecord || 0);
      this.recordRange.set(res.result?.recordRange || '');
      this.fromRecord.set(res.result?.fromRecord || 0);
      this.toRecord.set(res.result?.toRecord || 0);
      this.pageCount.set(res.result?.pageCount || 0);
      this.selectedIds.set(new Set());
    } catch {
    } finally {
      this.isLoading.set(false);
    }
  }

  handleViewKanban() {
    this.isKanbanView.set(true);
  }

  handleViewList() {
    this.isKanbanView.set(false);
  }

  handleClearFilter() {
    this.filterIsDelete.set(false);
    this.searchText.set('');
    this.filterDepartmentId.set('');
    this.filterJobTitleId.set('');
    this.filterStage.set('');
    this.filterMatchLevel.set('');
    this.filterGender.set('');
    this.pageIndex.set(1);
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  handleToggleSelect(id: string) {
    this.selectedIds.update((prev) => {
      const next = new Set(prev);

      next.has(id) ? next.delete(id) : next.add(id);

      return next;
    });
  }

  handleToggleSelectAll() {
    const allSelected = this.isSelectedAll();

    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      const list = this.candidates();

      if (allSelected) list.forEach((item) => next.delete(item.id));
      else list.forEach((item) => next.add(item.id));

      return next;
    });
  }

  async handleToggleStar(event: Event, item: CandidateModel) {
    event.stopPropagation();
    if (!this.authService.hasPermission(this.permissions.update)) return;

    const previousBookmarked = Boolean(item.isBookmarked);
    const nextBookmarked = !previousBookmarked;

    this.candidates.update((list) =>
      list.map((c) => (c.id === item.id ? { ...c, isBookmarked: nextBookmarked } : c)),
    );

    try {
      const payload: CandidateModel = {
        id: item.id,
        candidateCode: item.candidateCode ?? null,
        candidateName: item.candidateName,
        gender: item.gender ?? null,
        departmentId: item.departmentId || null,
        jobTitleId: item.jobTitleId || null,
        storeId: item.storeId || null,
        photo: item.photo ?? null,
        email: item.email ?? null,
        phoneNumber: item.phoneNumber ?? null,
        workLocation: item.workLocation ?? null,
        stage: item.stage ?? CandidateStage.Applied,
        appliedDate: item.appliedDate ?? null,
        expectedSalary: item.expectedSalary ?? null,
        experienceYears: item.experienceYears ?? null,
        matchScore: item.matchScore ?? null,
        skills: item.skills ?? null,
        fileAttach: item.fileAttach ?? null,
        interviewerNote: item.interviewerNote ?? null,
        isBookmarked: nextBookmarked,
        isDelete: item.isDelete ?? false,
        note: item.note ?? null,
      };
      await this.facade.update(payload);
    } catch {
      this.candidates.update((list) =>
        list.map((c) => (c.id === item.id ? { ...c, isBookmarked: previousBookmarked } : c)),
      );
    }
  }

  handleDragStart(event: DragEvent, item: CandidateModel) {
    this.draggedCandidateId.set(item.id);
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', item.id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  handleDragEnd() {
    this.draggedCandidateId.set(null);
    this.dragOverStage.set(null);
  }

  handleDragOver(event: DragEvent, stage: CandidateStage) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.dragOverStage() !== stage) {
      this.dragOverStage.set(stage);
    }
  }

  handleDragLeave(stage: CandidateStage) {
    if (this.dragOverStage() === stage) {
      this.dragOverStage.set(null);
    }
  }

  async handleDrop(event: DragEvent, targetStage: CandidateStage) {
    event.preventDefault();
    this.dragOverStage.set(null);

    const candidateId = event.dataTransfer?.getData('text/plain') || this.draggedCandidateId();
    this.draggedCandidateId.set(null);

    if (!candidateId) return;

    const item = this.candidates().find((c) => c.id === candidateId);
    if (!item) return;

    const currentStage = this.normalizeStage(item.stage);
    if (currentStage === targetStage) return;

    if (!this.authService.hasPermission(this.permissions.update)) return;

    const previousStage = item.stage;
    this.candidates.update((list) =>
      list.map((c) => (c.id === item.id ? { ...c, stage: targetStage } : c)),
    );

    try {
      const payload: CandidateModel = {
        id: item.id,
        candidateCode: item.candidateCode ?? null,
        candidateName: item.candidateName,
        gender: item.gender ?? null,
        departmentId: item.departmentId || null,
        jobTitleId: item.jobTitleId || null,
        storeId: item.storeId || null,
        photo: item.photo ?? null,
        email: item.email ?? null,
        phoneNumber: item.phoneNumber ?? null,
        workLocation: item.workLocation ?? null,
        stage: targetStage,
        appliedDate: item.appliedDate ?? null,
        expectedSalary: item.expectedSalary ?? null,
        experienceYears: item.experienceYears ?? null,
        matchScore: item.matchScore ?? null,
        skills: item.skills ?? null,
        fileAttach: item.fileAttach ?? null,
        interviewerNote: item.interviewerNote ?? null,
        isBookmarked: Boolean(item.isBookmarked),
        isDelete: item.isDelete ?? false,
        note: item.note ?? null,
      };
      await this.facade.update(payload);
    } catch {
      this.candidates.update((list) =>
        list.map((c) => (c.id === item.id ? { ...c, stage: previousStage } : c)),
      );
    }
  }

  openDetailModal(content: TemplateRef<unknown>, item: CandidateModel) {
    this.detailCandidate.set(item);
    this.modal.open(content, {
      size: 'lg',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
  }

  openStageCandidatesModal(content: TemplateRef<unknown>, stage: CandidateStage) {
    this.activeStageModalStage.set(stage);
    this.stageModalSearchText.set('');
    this.stageModalRef = this.modal.open(content, {
      size: 'lg',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
  }

  openDetailFromStageModal(detailContent: TemplateRef<unknown>, item: CandidateModel) {
    if (this.stageModalRef) {
      this.stageModalRef.close();
      this.stageModalRef = null;
    }
    this.openDetailModal(detailContent, item);
  }

  async handleDeleteSelected() {
    const idsArray = Array.from(this.selectedIds());
    if (idsArray.length === 0) return;

    const confirmed = await this.dialogService.confirm({
      title: 'common.confirmDelete',
      message:
        idsArray.length === 1 ? 'common.messageConfirmDelete' : 'common.messageConfirmDeleteMany',
      messageParams: { count: idsArray.length },
      type: 'danger',
      confirmText: 'common.confirm',
      cancelText: 'common.cancel',
    });

    if (!confirmed) return;

    try {
      if (!this.filterIsDelete()) await this.facade.softDelete(idsArray);
      else await this.facade.hardDelete(idsArray);

      await this.loadListData();
    } catch {}
  }

  handleOpenCreate() {
    const modalRef = this.modal.open(CandidateModal, {
      size: 'lg',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
    //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
    modalRef.componentInstance.saveSuccess.subscribe(() => this.loadListData());
    modalRef.componentInstance.initCreateForm();
  }

  handleOpenUpdate() {
    const item = this.getSelectedItem();
    if (!item) return;

    const modalRef = this.modal.open(CandidateModal, {
      size: 'lg',
      centered: true,
      scrollable: true,
      windowClass: 'custom-modal',
    });
    //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
    modalRef.componentInstance.saveSuccess.subscribe(() => this.loadListData());
    modalRef.componentInstance.initUpdateForm(item);
  }

  getSelectedItem(): CandidateModel | null {
    const idsArray = Array.from(this.selectedIds());
    if (idsArray.length !== 1) return null;

    return this.candidates().find((item) => item.id === idsArray[0]) ?? null;
  }

  exportFn = (filter: PagingRequest): Promise<Blob> => this.facade.export(filter);

  importFn = (file: File): Promise<any> => this.facade.import(file);

  openImportModal() {
    const modalRef = this.modal.open(Import, {
      size: 'lg',
      centered: true,
      windowClass: 'custom-modal',
      injector: Injector.create({
        parent: this.injector,
        providers: [{ provide: IMPORT_MODAL_CONTEXT, useValue: { importFn: this.importFn } }],
      }),
    });
    //* subscribe() đăng ký nhận giá trị từ Observable, thực hiện hành động khi có giá trị mới
    modalRef.componentInstance.importSuccess.subscribe(() => this.loadListData());
  }

  openExportModal() {
    this.modal.open(Export, {
      size: 'lg',
      centered: true,
      windowClass: 'custom-modal',
      injector: Injector.create({
        parent: this.injector,
        providers: [
          {
            provide: EXPORT_MODAL_CONTEXT,
            useValue: {
              exportFn: this.exportFn,
              currentFilter: this.buildFilter(),
              totalRecord: this.totalRecord(),
              fromRecord: this.fromRecord(),
              toRecord: this.toRecord(),
              selectedIds: this.selectedIds(),
              fileName: 'candidates',
            },
          },
        ],
      }),
    });
  }

  //#endregion
}
