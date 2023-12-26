import { checkUrl, checkPassUrl, checkOutUrl } from '@/athletics/config/images';
import { setStatisticList, getDateStrs, isArray, __hasOwnProp, coordtransform } from '@/utils/index';
export const auditStatusMap = {
  '-1': {
    text: '已取消',
    className: 'u-tips-color'
  },
  '0': {
    className: 'u-info',
    text: '待提交'
  },
  '1': {
    iconUrl: checkUrl,
    text: '待审核',
    className: 'u-warning'
  },
  '2': {
    iconUrl: checkOutUrl,
    text: '审核不通过',
    className: 'u-error'
  },
  '3': {
    iconUrl: checkPassUrl,
    text: '审核通过',
    className: 'u-success'
  }
};
export const signupStatusMap = {
  '0': {
    text: '待缴费',
    className: 'u-warning'
  },
  '1': {
    className: 'u-success',
    text: '报名成功'
  },
  '2': {
    text: '报名失败',
    className: 'u-error'
  },
  '3': {
    text: '已取消',
    className: 'u-tips-color'
  }
};
export const paymentStatusMap = {
  1: {
    text: '无需缴费',
    className: 'u-main-color'
  },
  2: {
    text: '未缴费',
    className: 'u-warning'
  },
  3: {
    text: '已缴费',
    className: 'u-main-color'
  }
};

export function getGroupList() {
  return [
    { label: '比赛项目', value: '', labelBlod: true, key: 'eventName' },
    { label: '组别', value: '', labelBlod: true, key: 'groupName' },
    { label: '报名时间', value: '', key: 'signDateStr' },
    { label: '比赛时间', value: '', key: 'eventDateStr' },
    { label: '比赛地点', value: '', key: 'siteAddress', openLocation: false, valueSuffixIcon: '' }
  ];
}

export function setgroupDataOpenLocation(groupConfig, groupDataList) {
  if (groupConfig.latitude || groupConfig.longitude) {
    groupDataList.find((item) => {
      if (item.key == 'siteAddress') {
        item.openLocation = true;
        item.name = item.value;
        item.valueSuffixIcon = 'icon-position-mark';
        let { latitude, longitude } = groupConfig;

        let arr: number[] = [];
        arr = coordtransform.bd09togcj02(longitude, latitude);
        (longitude = arr[0]), (latitude = arr[1]);

        item.latitude = latitude;
        item.longitude = longitude;
      }
    });
  }
}
export function handlePersonSignupApplyFormData(
  bizData,
  { groupConfig, teamInfo, groupDataList, priceDataList, formDataList, formDataMap, formData }
) {
  Object.assign(groupConfig, bizData.groupConfig);
  groupConfig.signDateStr = getDateStrs(groupConfig.signBeginTime, groupConfig.signEndTime);
  groupConfig.eventDateStr = getDateStrs(groupConfig.eventBeginTime, groupConfig.eventEndTime);
  if (teamInfo && bizData.teamInfo) {
    Object.assign(teamInfo, bizData.teamInfo);
  }
  const str = teamInfo ? '队员' : '';
  setStatisticList(groupConfig, groupDataList);
  setgroupDataOpenLocation(groupConfig, groupDataList);
  if (groupConfig.signFee) {
    priceDataList.push({
      label: `${groupConfig.groupName}${str}报名费用`,
      value: `${groupConfig.signFee}`
    });
  }
  if (groupConfig.securityDeposit) {
    priceDataList.push({
      label: `${groupConfig.groupName}${str}保证金`,
      value: `${groupConfig.securityDeposit}`
    });
  }

  bizData.collectionConfList.forEach((item) => {
    try {
      if (item.inputMap && typeof item.inputMap === 'string') {
        item.inputMap = JSON.parse(item.inputMap);
      } else {
        item.inputMap = {};
      }
      if (item.id) {
        item.id = String(item.id);
      }
      formDataMap[item.id] = item;
    } catch (e) {
      console.log(e);
    }
  });
  formDataList.push(...bizData.collectionConfList);
  formDataList.forEach((item) => {
    const id: string = item.id as string;
    if (item.collectionDesc === 'USER_CERT_PIC') {
      formData[id] = ['', ''];
    } else {
      formData[id] = '';
    }
  });
}
export function setSignupFormDataUserPhone(formDataList, formData, phone) {
  const userPhoneItem = formDataList.find((item) => {
    if (!item?.collectionDesc) {
      return;
    }
    return item.collectionDesc == 'USER_PHONE';
  });
  if (userPhoneItem) {
    formData[userPhoneItem.id] = phone.value;
  }
}
export function getFormDataNameAndPhone(formDataList, formData) {
  let userName, userPhone;
  const userNameItem = formDataList.find((item) => {
    if (!item?.collectionDesc) {
      return;
    }
    return item.collectionDesc == 'USER_NAME';
  });
  if (userNameItem) {
    userName = formData[userNameItem.id];
  }
  const userPhoneItem = formDataList.find((item) => {
    if (!item?.collectionDesc) {
      return;
    }
    return item.collectionDesc == 'USER_PHONE';
  });
  if (userPhoneItem) {
    userPhone = formData[userPhoneItem.id];
  }
  return {
    userName,
    userPhone
  };
}
export function getCollectionDataList(formData, formDataMap) {
  return Object.keys(formData).map((item) => {
    let value = formData[item];
    const collectionDataItem = formDataMap[item];
    let valueDesc = '';
    if (collectionDataItem.inputMode == 2 || collectionDataItem.inputMode == 3) {
      if (value && collectionDataItem?.inputMap?.itemList?.length) {
        let valueArr;
        if (Array.isArray(value)) {
          valueArr = value;
        } else {
          valueArr = [value];
        }
        const itemListMap = {};
        collectionDataItem.inputMap.itemList.forEach((item) => {
          itemListMap[item.itemValue] = item;
        });
        valueDesc = valueArr
          .map((item) => {
            return itemListMap[item]?.itemLabel;
          })
          .join(',');
      }
    } else if (collectionDataItem.collectionDesc === 'USER_CERT_PIC') {
      valueDesc = value.join(',');
    } else {
      valueDesc = value;
    }

    if (collectionDataItem.inputMode == 3 && isArray(value)) {
      value = value.join(',');
    } else if (collectionDataItem.collectionDesc === 'USER_CERT_PIC') {
      value = value.join(',');
    }
    return {
      collectionId: item,
      value,
      valueDesc,
      collectionDesc: formDataMap[item]?.collectionDesc || ''
    };
  });
}

export const bizTypeMap = {
  1: '报名费',
  2: '保证金'
};

export function setSignupFormData(dataList, formDataMap, formData) {
  dataList.forEach((item) => {
    if (__hasOwnProp.call(formData, item.collectionId)) {
      let value;
      if (formDataMap[item.collectionId]?.inputMode == 3) {
        if (item.value) {
          value = String(item.value).split(',');
        } else {
          value = [];
        }
      } else if (formDataMap[item.collectionId]?.collectionDesc == 'USER_CERT_PIC') {
        value = ['', ''];
        const valueArr = String(item.value).split(',');
        value[0] = valueArr[0] || '';
        value[1] = valueArr[1] || '';
      } else {
        value = item.value;
      }
      formData[item.collectionId] = value;
    }
  });
}

export function setPriceDataList(bizData, list, { priceDataList, paymentStatus }) {
  const signFeeItem = list.find((item) => item.bizType == 1) || {};
  const securityDepositItem = list.find((item) => item.bizType == 2) || {};
  priceDataList.length = 0;
  if (bizData.signFee) {
    priceDataList.push(
      {
        label: '报名费用',
        value: `${bizData.signFee}`,
        valuePrefix: '￥'
      },
      {
        label: '缴费状态',
        value: `${paymentStatusMap[signFeeItem.paymentStatus]?.text || ''}`,
        className: paymentStatusMap[signFeeItem.paymentStatus]?.className
      }
    );
  }
  if (bizData.securityDeposit) {
    priceDataList.push(
      {
        label: '保证金',
        value: `${bizData.securityDeposit}`,
        valuePrefix: '￥'
      },
      {
        label: '缴费状态',
        value: `${paymentStatusMap[securityDepositItem.paymentStatus]?.text || ''}`,
        className: paymentStatusMap[securityDepositItem.paymentStatus]?.className
      }
    );
  }
  if (signFeeItem.paymentStatus == 2 || securityDepositItem.paymentStatus == 2) {
    paymentStatus.value = 2;
  }
}
