import { APPEAL_STREAM_STATUS, AppealStreamStatusEnum } from '@/utils/enumerate'
const allOption = [
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.WAIT_FIRST],
    value: APPEAL_STREAM_STATUS.WAIT_FIRST
  }, {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.FIRST_EXAMINE],
    value: APPEAL_STREAM_STATUS.FIRST_EXAMINE
  },
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.WAIT_SECOND],
    value: APPEAL_STREAM_STATUS.WAIT_SECOND
  },
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.SECOND_EXAMINE],
    value: APPEAL_STREAM_STATUS.SECOND_EXAMINE
  },
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.FINISH],
    value: APPEAL_STREAM_STATUS.FINISH
  },
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.EXPIRE],
    value: APPEAL_STREAM_STATUS.EXPIRE
  }
]
const firstOption = [
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.WAIT_FIRST],
    value: APPEAL_STREAM_STATUS.WAIT_FIRST
  }, {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.FIRST_EXAMINE],
    value: APPEAL_STREAM_STATUS.FIRST_EXAMINE
  }
]
const secondOption = [
  {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.WAIT_SECOND],
    value: APPEAL_STREAM_STATUS.WAIT_SECOND
  }, {
    label: AppealStreamStatusEnum[APPEAL_STREAM_STATUS.SECOND_EXAMINE],
    value: APPEAL_STREAM_STATUS.SECOND_EXAMINE
  }
]

export {
  allOption,
  firstOption,
  secondOption
}
