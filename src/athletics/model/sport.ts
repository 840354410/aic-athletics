export interface Page {
  pageNo: number;
  pageSize: number;
}
export interface SportHomeEventReq extends Page {
  hotFlag: '' | 0 | 1;
}
export interface SportHomeEventRes {
  eventId: number;
  eventLogo: string;
  eventName: string;
  groupList: [];
  sportTags: string;
}

export type SportEventGroupListReq = Page;
export interface SportEventGroupListRes {
  createBy: string;
  createTime: string;
  eventBeginTime: string;
  eventEndTime: string;
  eventId: number;
  eventLogo: string;
  eventName: string;
  // 赛事报名状态 1:报名未开始 2:报名中 3:报名已结束
  eventSignupStatus: 1 | 2 | 3;
  groupName: string;
  id: number;
  individualPayment: boolean;
  // 保证金，单位：元，为0表示无需缴纳
  securityDeposit: number;
  // 保证金支付模式 1:队伍缴纳 2:个人缴纳
  securityDepositPayMode: 1 | 2;
  signBeginTime: string;
  signEndTime: string;
  // 报名费用，单位：元，为0表示无需缴纳
  signFee: number;
  // 	报名支付模式 1:队伍缴纳 2:个人缴纳
  signPayMode: 1 | 2;
  siteAddress: string;
  sponsorName: string;
  sportTags: string;
  status: number;
  // 队伍限制 1:有限制 0:无限制
  teamLimitType: number;
  teamMemberAgeMax: number;
  teamMemberAgeMin: number;
  teamMemberBirthMax: string;
  teamMemberBirthMin: string;
  teamMemberMax: number;
  teamMemberMin: number;
  // 队伍性别限制 1:男 2:女
  teamMemberSexLimit: 1 | 2;
  teamPayment: boolean;
  updateBy: string;
  updateTime: string;
  // 自定义字段
  signDateStr?: string;
  eventDateStr?: string;
}

export interface GroupInfo {
  eventBeginTime: number;
  eventEndTime: number;
  eventGroupId: number;
  eventSignupStatus: 1 | 2 | 3;
  groupName: string;
  securityDeposit: number;
  securityDepositPayMode: number;
  signBeginTime: number;
  signEndTime: number;
  signFee: number;
  signPayMode: number;
  teamLimitType: number;
  sponsorName: string;
  eventMode: string | number;
}
export interface SportEventDetailRes {
  basicInfo: {
    eventDesc: string;
    eventLogo: string;
    eventName: string;
    orgDesc: string;
    signNotes: string;
    sponsorId: string;
    sportTags: string;
  };
  disclaimer: string;
  groupInfo: GroupInfo[];
  userCollectionList: {
    collectionTitle: string;
    editable: number;
    inputMode: number;
    requiredType: number;
    sort: number;
    userCollectionId: number;
  }[];
}

export interface SportTeamListReq extends Page {
  eventGroupId: string | number;
  eventId: string | number;
  offset?: number;
  signupStatus: '' | 0 | 1 | 2 | 3; // 报名状态 0:未完成缴费 1:报名成功 2:报名失败 3:报名取消
  teamName: string; // 队伍名称
}
export interface SportTeamListRes {
  teamDesc: string;
  teamId: number;
  teamLogo: string;
  teamName: string;
  teamSignupId: number;
  leaderName: string;
}

export interface PersonSignupApplyFormReq {
  joinCode?: string | number;
  teamSignupId: string | number;
}
export interface CollectionConfItem {
  collectionDesc: string;
  collectionTitle: string;
  createBy: string;
  createTime: string;
  editable: number;
  eventId: number;
  id: string | number;
  // 录入内容映射
  inputMap: Partial<{
    inputTitle: string;
    inputHint: string;
    charType: 'text' | 'number' | 'date' | 'time' | 'datetime' | 'year-month';
    limitRule: string;
    limitErrorHint: string;
    itemList: { itemLabel: string; itemValue: string }[];
    maxCount: string | number;
    inputType: 'Face' | 'Cert' | 'Photo';
  }>;
  // 录入模式 1:文本录入 2:单选 3:多选 4:图片
  inputMode: 1 | 2 | 3 | 4;
  remark: string;
  required: boolean;
  requiredType: number;
  sort: number;
  status: number;
  updateBy: string;
  updateTime: string;
}
export interface PersonSignupApplyFormRes {
  collectionConfList: CollectionConfItem[];
  groupConfig: SportEventGroupListRes;
  teamInfo: SportTeamListRes;
}

export interface collectionDataItem {
  collectionDesc: string;
  label?: string;
  collectionId: string | number;
  value: string | number;
  valueDesc: string;
}
export interface PersonSignupApply {
  dataList: collectionDataItem[];
  joinCode?: string | number;
  userId?: string | number;
  userName: string;
  userPhone: string;
}
export interface PersonSignupApplyReq extends PersonSignupApply {
  teamSignupId: string | number;
}
export interface IndividualSignupApplyReq extends PersonSignupApply {
  eventGroupId: string | number;
}

export interface UpdateSignupApplyDataReq extends PersonSignupApplyReq {
  memberId: string | number;
}

export interface IndividualUpdateSignupApplyDataReq extends PersonSignupApply {
  individualSignupId: string | number;
}

export interface SportTeamAddReq {
  eventGroupId?: string | number;
  joinCode?: string;
  leaderName: string;
  leaderPhone: string;
  teamLogo: string;
  teamName: string;
}
export interface SportTeamAddRes {
  teamId: string | number;
  teamSignupId: string | number;
}

export interface OrderConfirmInfoReq {
  memberId?: string | number;
  teamSignupId: string | number;
}
export interface OrderItem {
  payAmt: string | number;
  signupOrderId: string | number;
  signupOrderTitle: string;
  teamName: string;
  signupType: string | number;
}
export interface OrderConfirmInfoRes {
  eventGroupName: string;
  eventName: string;
  eventTeamLogo: string;
  eventTeamName: string;
  orderItemList: OrderItem[];
  totalAmt: string | number;
}

export interface TeamMemberItem {
  createBy: string;
  createTime: string;
  eventGroupId: string | number;
  joinStatus: string | number;
  memberAvatar: string;
  memberId: string | number;
  memberName: string;
  memberPhone: string;
  roleCode: string;
  roleId: number;
  roleName: string;
  sportEventId: string | number;
  status: number;
  teamId: string | number;
  teamSignupId: string | number;
  updateBy: string;
  updateTime: string;
  userId: string | number;
  [propName: string]: any;
}
export type TeamWorkerItem = TeamMemberItem;
export interface TeamSignupDataRes {
  auditRemark: string;
  // 0:待提交 1:待审核 2:审核不通过 3:审核通过
  auditStatus: string | number;
  eventId: string | number;
  eventName: string;
  eventTeamCode: string;
  eventTeamLogo: string;
  eventTeamName: string;
  groupName: string;
  memberSignupOrderList: any[] | undefined;
  securityDeposit: string;
  securityDepositPayMode: number;
  signFee: string;
  signPayMode: number;
  signupStatus: string | number;
  teamJoinCode: string;
  teamMemberList: TeamMemberItem[] | undefined;
  teamSignupId: number;
  teamSignupOrderList: any[] | undefined;
  teamWorkerList: TeamWorkerItem[] | undefined;
  teamMemberMin: string | number;
  teamMemberMax: string | number;
  leaderInfo: {
    memberName: string;
    memberPhone: string;
  };
  signBeginTime: string;
  signEndTime: string;
  eventBeginTime: string;
  eventEndTime: string;
  [propName: string]: any;
}

export interface IndividualSignupInfoRes {
  eventBeginTime: string;
  eventEndTime: string;
  eventName: string;
  groupName: string;
  securityDeposit: string;
  securityDepositPayMode: number;
  signBeginTime: string;
  signEndTime: string;
  signFee: string;
  signPayMode: number;
  auditRemark: string;
  // 0:待提交 1:待审核 2:审核不通过 3:审核通过
  auditStatus: string | number;
  memberSignupOrderList: any[] | undefined;
  signupStatus: string | number;
  signupInfo: {
    signupUserName: string;
    signupUserPhone: string;
    eventGroupId: string | number;
  };
  signupOrderList: any[];
  [propName: string]: any;
}

export interface InvitationQrcodeReq {
  invitationType: string | number;
  teamSignupId: string | number;
}
export interface InvitationQrcodeRes {
  eventGroupName: string;
  eventName: string;
  eventTeamCode: string | number;
  invitationType: string | number;
  inviteTeamName: string;
  inviterName: string;
  inviterUserId: string | number;
  qrCodeBase64: string;
  qrCodeValue: string;
  teamSignupId: string | number;
}

export interface UpdateEventTeamInfoReq {
  eventTeamLogo: string;
  eventTeamName?: string;
  leaderName?: string;
  teamJoinCode?: string | number;
  teamSignupId?: string | number;
}

export interface TeamWorkerRolesRes {
  createBy: string;
  createTime: string;
  id: string | number;
  roleCode: string;
  roleDesc: string;
  roleName: string;
  status: string | number;
  updateBy: string;
  updateTime: string;
}

export interface WorkerInfoItem {
  memberAvatar: string;
  memberId: string | number;
  memberName: string;
  memberPhone: string;
  userId: string | number;
  userRoleIds: [];
}

export interface AddTeamWorkerReq extends WorkerInfoItem {
  teamSignupId: string | number;
}

export interface AddTeamWorkersReq {
  teamSignupId: string | number;
  workerInfos: WorkerInfoItem[];
}

export interface TeamSignupListByLeaderRes {
  auditRemark: string;
  // 0:待提交 1:待审核 2:审核不通过 3:审核通过
  auditStatus: string | number;
  eventBeginTime: string;
  eventEndTime: string;
  eventLogo: string;
  eventName: string;
  eventStatus: string | number;
  eventTeamLogo: string;
  eventTeamName: string;
  groupName: string;
  securityDeposit: string;
  securityDepositOrderList: any[];
  securityDepositPayMode: string | number;
  signFee: string | number;
  signFeeOrderList: any[];
  signPayMode: string | number;
  signupDate: string;
  signupStatus: string | number;
  signupTime: string;
  sportTags: string;
  teamSignupId?: string | number;
  individualSignupId?: string | number;
  signupUserName?: string;
}

export interface TeamListByMemberUserRes extends TeamSignupListByLeaderRes {
  roleName: string;
  auditStatus: string | number;
  unpaidPayment: boolean;
  // 0：不显示，1:无需缴费 2:待缴费 3:已缴费
  paymentStatus: string | number;
}

export interface AnalyzeInvitationQrcodeRes {
  eventGroupInfo: SportEventGroupListRes;
  eventTeamCode: string;
  hasJoinCode: number;
  invitationType: string | number;
  teamSignupId: string | number;
}

export interface TeamSignupReq {
  eventGroupId: string | number;
  joinCode?: string | number;
  teamId: string | number;
}

export interface GetMemberSignupApplyInfoDataReq {
  teamSignupId: string | number;
  memberId: string | number;
}
export interface GetMemberSignupApplyInfoDataRes {
  memberSignup: {
    auditStatus: string;
  };
  signupApplyInfo: {
    dataList: collectionDataItem[];
  };
}

export interface SportTeamDetailRes {
  id: number;
  joinCode: string | number;
  leaderName: string;
  leaderPhone: string;
  teamDesc: string;
  teamLogo: string;
  teamName: string;
}

export interface GetIndividualSignupApplyInfoDataRes {
  signupInfo: {
    auditStatus: string;
  };
  signupApplyInfo: {
    dataList: collectionDataItem[];
  };
}

export interface UpdateTeamReq {
  teamId: string | number;
  teamLogo: string;
}

export interface GenerateMinaUrlReq {
  path: string;
  query: string;
}
