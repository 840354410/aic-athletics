import http from '@/http/HttpClient';
import { BaseResponse } from '@/model/BaseResponse';
import {
  SportHomeEventReq,
  SportHomeEventRes,
  SportEventGroupListReq,
  SportEventGroupListRes,
  SportEventDetailRes,
  SportTeamListReq,
  SportTeamListRes,
  PersonSignupApplyFormReq,
  PersonSignupApplyFormRes,
  PersonSignupApplyReq,
  IndividualSignupApplyReq,
  UpdateSignupApplyDataReq,
  SportTeamAddReq,
  SportTeamAddRes,
  OrderConfirmInfoReq,
  OrderConfirmInfoRes,
  TeamSignupDataRes,
  IndividualSignupInfoRes,
  InvitationQrcodeReq,
  InvitationQrcodeRes,
  UpdateEventTeamInfoReq,
  TeamWorkerRolesRes,
  AddTeamWorkerReq,
  AddTeamWorkersReq,
  TeamSignupListByLeaderRes,
  TeamListByMemberUserRes,
  AnalyzeInvitationQrcodeRes,
  TeamSignupReq,
  GetMemberSignupApplyInfoDataReq,
  GetMemberSignupApplyInfoDataRes,
  SportTeamDetailRes,
  GetIndividualSignupApplyInfoDataRes,
  IndividualUpdateSignupApplyDataReq,
  UpdateTeamReq,
  GenerateMinaUrlReq
} from '@/athletics/model/sport';
const formDataConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};
export function sportHomeEventsApi(data: SportHomeEventReq): Promise<BaseResponse<SportHomeEventRes[]>> {
  return http.post('sport/home/events', data);
}
export function sportEventGroupListApi(data: SportEventGroupListReq): Promise<BaseResponse<SportEventGroupListRes[]>> {
  return http.post('sport/event/eventGroupList', data);
}
export function sportEventDetailApi(eventId): Promise<BaseResponse<SportEventDetailRes>> {
  return http.get('sport/event/detail/' + eventId, {});
}
export function sportTeamListApi(data: SportTeamListReq): Promise<BaseResponse<SportTeamListRes[]>> {
  return http.post('sport/team/list', data);
}
export function checkJoinTeamCodeApi(data): Promise<BaseResponse<undefined>> {
  const teamSignupId = data.teamSignupId;
  delete data.teamSignupId;
  return http.post('sport/team/checkJoinTeamCode/' + teamSignupId, data, formDataConfig);
}
export function sportMyTeamListApi(data = {}): Promise<BaseResponse<SportTeamListRes[]>> {
  return http.post('sport/team/myTeam', data);
}
export function personSignupApplyFormApi(data: PersonSignupApplyFormReq): Promise<BaseResponse<PersonSignupApplyFormRes>> {
  return http.post('sport/team/personSignupApplyForm', data);
}
export function personSignupApplyApi(data: PersonSignupApplyReq): Promise<BaseResponse<undefined>> {
  return http.post('sport/team/personSignupApply', data);
}
export function updateSignupApplyDataApi(data: UpdateSignupApplyDataReq): Promise<BaseResponse<undefined>> {
  return http.post('sport/team/updateSignupApplyData', data);
}
export function sportTeamAddApi(data: SportTeamAddReq): Promise<BaseResponse<SportTeamAddRes>> {
  return http.post('sport/team/add', data);
}
export function orderConfirmInfoApi(data: OrderConfirmInfoReq): Promise<BaseResponse<OrderConfirmInfoRes>> {
  return http.post('sport/order/orderConfirmInfo', data);
}
export function teamSignupDataApi(teamSignupId): Promise<BaseResponse<TeamSignupDataRes>> {
  return http.get(`sport/team/teamSignup/${teamSignupId}`);
}
export function invitationQrcodeApi(data: InvitationQrcodeReq): Promise<BaseResponse<InvitationQrcodeRes>> {
  return http.post('sport/team/invitationQrcode', data, formDataConfig);
}
export function updateEventTeamInfoApi(data: UpdateEventTeamInfoReq): Promise<BaseResponse<undefined>> {
  return http.post('sport/team/updateEventTeamInfo', data);
}
export function teamWorkerRolesApi(data = {}): Promise<BaseResponse<TeamWorkerRolesRes[]>> {
  return http.get('sport/team/teamWorkerRoles', data);
}
export function addTeamWorkerApi(data: AddTeamWorkerReq): Promise<BaseResponse<undefined>> {
  return http.post('sport/team/addTeamWorker', data);
}
export function addTeamWorkersApi(data: AddTeamWorkersReq): Promise<BaseResponse<undefined>> {
  return http.post('sport/team/addTeamWorkers', data);
}
export function teamSignupListByLeaderApi(data = {}): Promise<BaseResponse<TeamSignupListByLeaderRes[]>> {
  return http.post('sport/team/teamSignupListByLeader', data);
}
export function signupListByUserApi(data = {}): Promise<BaseResponse<TeamSignupListByLeaderRes[]>> {
  return http.post('sport/order/signupListByUser', data);
}
export function getTeamListByMemberUserApi(data = {}): Promise<BaseResponse<TeamListByMemberUserRes[]>> {
  return http.post('sport/team/getTeamListByMemberUser', data);
}
export function teamSignupInfoApi(teamSignupId): Promise<BaseResponse<TeamSignupDataRes>> {
  return http.get('sport/team/teamSignupInfo', {
    params: {
      teamSignupId
    }
  });
}
export function teamSignupCancelApi(teamSignupId): Promise<BaseResponse<undefined>> {
  return http.post(
    'sport/team/cancelTeamSignup',
    {
      teamSignupId
    },
    formDataConfig
  );
}

export function memberSignupInfoApi(teamSignupId, memberId): Promise<BaseResponse<TeamSignupDataRes>> {
  return http.get('sport/team/memberSignupInfo', {
    params: {
      teamSignupId,
      memberId
    }
  });
}
export function cancelMemberSignupApi(memberSignupId): Promise<BaseResponse<undefined>> {
  return http.post(
    'sport/team/cancelMemberSignup',
    {
      memberSignupId
    },
    formDataConfig
  );
}
export function analyzeInvitationQrcodeApi(token): Promise<BaseResponse<AnalyzeInvitationQrcodeRes>> {
  return http.post(
    'sport/team/analyzeInvitationQrcode',
    {
      token
    },
    formDataConfig
  );
}
export function teamSignupApi(data: TeamSignupReq): Promise<BaseResponse<undefined>> {
  return http.post('sport/team/teamSignup', data);
}
export function getMemberSignupApplyInfoDataApi(
  data: GetMemberSignupApplyInfoDataReq
): Promise<BaseResponse<GetMemberSignupApplyInfoDataRes>> {
  return http.post('sport/team/getMemberSignupApplyInfoData', data);
}
export function auditMemberApi(data: {
  auditRemark?: string;
  auditStatus: string | number;
  memberSignupId: string | number;
}): Promise<BaseResponse<undefined>> {
  return http.post('sport/team/auditMember', data);
}
export function sportTeamDetailApi(eventId): Promise<BaseResponse<SportTeamDetailRes>> {
  return http.get('sport/team/detail/' + eventId, {});
}

export function individualSignupApplyInfoFormApi(eventGroupId): Promise<BaseResponse<PersonSignupApplyFormRes>> {
  const data = {
    eventGroupId
  };
  return http.post('sport/individual/getSignupApplyInfoForm', data);
}
export function individualSignupApplyApi(data: IndividualSignupApplyReq): Promise<BaseResponse<undefined>> {
  return http.post('sport/individual/personSignupApply', data);
}
export function getIndividualSignupApplyInfoDataApi(
  individualSignupId
): Promise<BaseResponse<GetIndividualSignupApplyInfoDataRes>> {
  const data = {
    individualSignupId
  };
  return http.post('sport/individual/getSignupApplyInfoData', data);
}
export function getSignupOrderConfirmInfoByIndividualApi(individualSignupId): Promise<BaseResponse<OrderConfirmInfoRes>> {
  const data = {
    individualSignupId
  };
  return http.post('sport/order/getSignupOrderConfirmInfoByIndividual', data, formDataConfig);
}
export function individualSignupInfoApi(signupId): Promise<BaseResponse<IndividualSignupInfoRes>> {
  return http.get('sport/individual/getSignupInfo', {
    params: {
      signupId
    }
  });
}
export function individualCancelSignupApi(signupId): Promise<BaseResponse<undefined>> {
  return http.post(
    'sport/individual/cancelSignup',
    {
      signupId
    },
    formDataConfig
  );
}
export function individualUpdateSignupApplyDataApi(data: IndividualUpdateSignupApplyDataReq): Promise<BaseResponse<undefined>> {
  return http.post('sport/individual/updateSignupApplyData', data);
}

export function getTeamRemainNumApi(eventGroupId): Promise<BaseResponse<number>> {
  const data = {
    eventGroupId
  };
  return http.post('sport/team/getRemainNum', data, formDataConfig);
}

export function getIndividualRemainNumApi(eventGroupId): Promise<BaseResponse<number>> {
  const data = {
    eventGroupId
  };
  return http.post('sport/individual/getRemainNum', data, formDataConfig);
}
export function updateTeamApi(data: UpdateTeamReq): Promise<BaseResponse<undefined>> {
  return http.post('sport/team/update', data);
}
export function getQrCodeBgApi(eventId): Promise<BaseResponse<string>> {
  return http.get('sport/event/qrCodeBg', {
    params: {
      eventId
    }
  });
}
export function generateMinaUrlApi(data: GenerateMinaUrlReq): Promise<BaseResponse<string>> {
  return http.post('sport/minaAuth/generateMinaUrl', data);
}
