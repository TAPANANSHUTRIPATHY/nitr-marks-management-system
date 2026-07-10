export const calculateGrade = (preMid, postMid, maxPreMid, maxPostMid) => {
  const pre = preMid !== null && preMid !== undefined && preMid !== '' ? parseFloat(preMid) : NaN;
  const post = postMid !== null && postMid !== undefined && postMid !== '' ? parseFloat(postMid) : NaN;
  
  if (isNaN(pre) && isNaN(post)) {
    return { total: '-', percentage: '-', grade: '-', gradePoint: '-' };
  }

  const actualPre = isNaN(pre) ? 0 : pre;
  const actualPost = isNaN(post) ? 0 : post;
  
  const total = actualPre + actualPost;
  const max = (maxPreMid || 0) + (maxPostMid || 0);
  
  if (max === 0) {
    return { total, percentage: 0, grade: 'F', gradePoint: 0 };
  }
  
  const percentage = (total / max) * 100;
  const rounded = Math.round(percentage);
  
  let grade = 'F';
  let gradePoint = 0;
  
  if (rounded >= 90) {
    grade = 'O';
    gradePoint = 10;
  } else if (rounded >= 80) {
    grade = 'E';
    gradePoint = 9;
  } else if (rounded >= 70) {
    grade = 'A';
    gradePoint = 8;
  } else if (rounded >= 60) {
    grade = 'B';
    gradePoint = 7;
  } else if (rounded >= 50) {
    grade = 'C';
    gradePoint = 6;
  } else if (rounded >= 40) {
    grade = 'D';
    gradePoint = 5;
  } else {
    grade = 'F';
    gradePoint = 0;
  }
  
  return {
    total: parseFloat(total.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(2)),
    grade,
    gradePoint
  };
};

export const getGradeColor = (grade) => {
  switch (grade) {
    case 'O': return 'var(--grade-o)';
    case 'E': return 'var(--grade-e)';
    case 'A': return 'var(--grade-a)';
    case 'B': return 'var(--grade-b)';
    case 'C': return 'var(--grade-c)';
    case 'D': return 'var(--grade-d)';
    case 'F': return 'var(--grade-f)';
    default: return 'var(--text-secondary)';
  }
};
