export enum ScormEventEnum {
  // SCORM 1.1, 1.2 events
  LMS_INITIALIZE = 'LMSInitialize', // Init session
  LMS_FINISH = 'LMSFinish', // Finish session
  LMS_GET_VALUE = 'LMSGetValue', // Get value
  LMS_SET_VALUE = 'LMSSetValue', // Set value
  LMS_COMMIT = 'LMSCommit', // Commit changes
  LMS_GET_LAST_ERROR = 'LMSGetLastError', // Get last error
  LMS_GET_ERROR_STRING = 'LMSGetErrorString', // Get error string
  LMS_GET_DIAGNOSTIC = 'LMSGetDiagnostic', // Get diagnostic

  // SCORM 2004 equivalents
  INITIALIZE = 'Initialize', // Init session
  TERMINATE = 'Terminate', // Terminate session
  GET_VALUE = 'GetValue', // Get value
  SET_VALUE = 'SetValue', // Set value
  COMMIT = 'Commit', // Commit changes
  GET_LAST_ERROR = 'GetLastError', // Get last error
  GET_ERROR_STRING = 'GetErrorString', // Get error string
  GET_DIAGNOSTIC = 'GetDiagnostic', // Get diagnostic
}

export enum ScormCmiEnum {
  // SCORM 2004 core
  COMPLETION_STATUS = 'cmi.completion_status', // Lesson completion
  SUCCESS_STATUS = 'cmi.success_status', // Lesson success
  SCORE_RAW = 'cmi.score.raw', // Raw score
  SCORE_SCALED = 'cmi.score.scaled', // Scaled score (0-1)
  SCORE_MIN = 'cmi.score.min', // Min score
  SCORE_MAX = 'cmi.score.max', // Max score
  LOCATION = 'cmi.location', // Bookmark/location
  SUSPEND_DATA = 'cmi.suspend_data', // Custom data
  ENTRY = 'cmi.entry', // Entry mode
  EXIT = 'cmi.exit', // Exit mode
  SESSION_TIME = 'cmi.session_time', // Session time
  TOTAL_TIME = 'cmi.total_time', // Total time
  MODE = 'cmi.mode', // Execution mode
  CREDIT = 'cmi.credit', // Credit mode
  LEARNER_NAME = 'cmi.learner_name', // Learner name
  LEARNER_ID = 'cmi.learner_id', // Learner ID

  // SCORM 1.1, 1.2 core equivalents
  CORE_LESSON_STATUS = 'cmi.core.lesson_status', // Lesson status
  CORE_SCORE_RAW = 'cmi.core.score.raw', // Raw score
  CORE_LESSON_LOCATION = 'cmi.core.lesson_location', // Bookmark/location
  CORE_SUSPEND_DATA = 'cmi.core.suspend_data', // Custom data
  CORE_LESSON_MODE = 'cmi.core.lesson_mode', // Execution mode
  CORE_CREDIT = 'cmi.core.credit', // Credit mode
  CORE_STUDENT_NAME = 'cmi.core.student_name', // Student name
  CORE_STUDENT_ID = 'cmi.core.student_id', // Student ID
}
