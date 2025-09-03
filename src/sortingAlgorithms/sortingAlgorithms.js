import React from 'react';

// Merge Sort Algorithm
export function getMergeSortAnimationsNew(arr) {
  const originalArray = arr.slice(); // Preserve original
  const workingArray = arr.slice(); // Work on copy
  const animations = [];

  function mergeSort(start, end) {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);
    mergeSort(start, mid);
    mergeSort(mid + 1, end);
    merge(start, mid, end);
  }

  function merge(start, mid, end) {
    let left = workingArray.slice(start, mid + 1);
    let right = workingArray.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
      const leftIdx = start + i;
      const rightIdx = mid + 1 + j;
      
      animations.push({ type: "compare", indices: [leftIdx, rightIdx] });

      if (left[i] <= right[j]) {
        animations.push({ type: "overwrite", index: k, value: left[i] });
        workingArray[k] = left[i];
        i++;
      } else {
        animations.push({ type: "overwrite", index: k, value: right[j] });
        workingArray[k] = right[j];
        j++;
      }
      
      animations.push({ type: "revert", indices: [leftIdx, rightIdx] });
      k++;
    }

    while (i < left.length) {
      animations.push({ type: "overwrite", index: k, value: left[i] });
      workingArray[k] = left[i];
      i++;
      k++;
    }

    while (j < right.length) {
      animations.push({ type: "overwrite", index: k, value: right[j] });
      workingArray[k] = right[j];
      j++;
      k++;
    }
  }

  mergeSort(0, workingArray.length - 1);
  return { animations, sorted: workingArray, original: originalArray };
}

// Bubble Sort Algorithm
export function getBubbleSortAnimations(array) {
  const originalArray = array.slice(); // Preserve original
  const arr = array.slice(); // Work on copy
  const animations = [];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      animations.push({ type: "compare", indices: [j, j + 1] });
      
      if (arr[j] > arr[j + 1]) {
        animations.push({ type: "swap", indices: [j, j + 1] });
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
      
      animations.push({ type: "revert", indices: [j, j + 1] });
    }
  }
  
  return { animations, sorted: arr, original: originalArray };
}

// Quick Sort Algorithm
export function getQuickSortAnimations(array) {
  const originalArray = array.slice(); // Preserve original
  const arr = array.slice(); // Work on copy
  const animations = [];
  
  function quickSortHelper(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    }
  }
  
  function partition(low, high) {
    const pivot = arr[high];
    animations.push({ type: "pivot", index: high });
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      animations.push({ type: "compare", indices: [j, high] });
      
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          animations.push({ type: "swap", indices: [i, j] });
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      
      animations.push({ type: "revert", indices: [j, high] });
    }
    
    if (i + 1 !== high) {
      animations.push({ type: "swap", indices: [i + 1, high] });
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    }
    
    animations.push({ type: "revert", indices: [high, high] });
    
    return i + 1;
  }
  
  quickSortHelper(0, arr.length - 1);
  return { animations, sorted: arr, original: originalArray };
}

// Selection Sort Algorithm
export function getSelectionSortAnimations(array) {
  const originalArray = array.slice(); // Preserve original
  const arr = array.slice(); // Work on copy
  const animations = [];
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    animations.push({ type: "pivot", index: i });
    
    for (let j = i + 1; j < n; j++) {
      animations.push({ type: "compare", indices: [minIdx, j] });
      
      if (arr[j] < arr[minIdx]) {
        if (minIdx !== i) {
          animations.push({ type: "revert", indices: [minIdx, minIdx] });
        }
        minIdx = j;
        animations.push({ type: "pivot", index: minIdx });
      }
      
      animations.push({ type: "revert", indices: [minIdx, j] });
    }
    
    if (minIdx !== i) {
      animations.push({ type: "swap", indices: [i, minIdx] });
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    
    animations.push({ type: "revert", indices: [i, minIdx] });
  }
  
  return { animations, sorted: arr, original: originalArray };
}