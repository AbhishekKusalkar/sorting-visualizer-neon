import React, { useEffect, useRef, useState } from 'react';
import './EnhancedVisualizer.css';
import { getBubbleSortAnimations, getQuickSortAnimations, getMergeSortAnimationsNew, getSelectionSortAnimations } from '../algorithms/animations';

const DEFAULT_SIZE = 140;
const MIN_VAL = 5;
const MAX_VAL = 400;

export default function EnhancedVisualizer() {
  const [array, setArray] = useState([]);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [speed, setSpeed] = useState(12);
  const [isSorting, setIsSorting] = useState(false);
  const [algo, setAlgo] = useState('merge');
  const [isSorted, setIsSorted] = useState(false);
  
  const containerRef = useRef(null);
  const originalArrayRef = useRef([]); 

  // Generate new random array
  const generateArray = () => {
    if (isSorting) return;
    
    const newArray = Array.from({ length: size }, () =>
      Math.floor(Math.random() * (MAX_VAL - MIN_VAL + 1)) + MIN_VAL
    );
    
    // Store the original array and set current state
    originalArrayRef.current = [...newArray];
    setArray([...newArray]);
    setIsSorted(false);
    
    // Reset visual bars
    resetBarsToArray(newArray);
  };

  // Reset bars to show a specific array
  const resetBarsToArray = (targetArray) => {
    if (!containerRef.current) return;
    
    const bars = containerRef.current.children;
    for (let i = 0; i < bars.length && i < targetArray.length; i++) {
      bars[i].className = 'bar';
      bars[i].style.height = `${targetArray[i]}px`;
    }
  };

  // Initialize on mount and size change
  useEffect(() => {
    generateArray();
    // eslint-disable-next-line
  }, [size]);

  // Animation function
  const runAnimations = async (animations, sortedArray) => {
    setIsSorting(true);
    const bars = containerRef.current?.children;
    if (!bars) return;
    
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Keep track of current bar heights during animation
    let currentHeights = [...originalArrayRef.current];
    
    try {
      // Process each animation step
      for (const animation of animations) {
        const { type, indices, index, value } = animation;
        
        switch (type) {
          case 'compare':
            if (indices && indices.length >= 2) {
              const [i, j] = indices;
              if (bars[i]) bars[i].classList.add('bar-compare');
              if (bars[j]) bars[j].classList.add('bar-compare');
            }
            break;
            
          case 'swap':
            if (indices && indices.length >= 2) {
              const [i, j] = indices;
              if (i < currentHeights.length && j < currentHeights.length) {
                // Swap in our tracking array
                [currentHeights[i], currentHeights[j]] = [currentHeights[j], currentHeights[i]];
                
                // Update visual heights
                if (bars[i]) {
                  bars[i].style.height = `${currentHeights[i]}px`;
                  bars[i].classList.add('bar-swap');
                }
                if (bars[j]) {
                  bars[j].style.height = `${currentHeights[j]}px`;
                  bars[j].classList.add('bar-swap');
                }
              }
            }
            break;
            
          case 'overwrite':
            if (typeof index === 'number' && typeof value === 'number') {
              if (index < currentHeights.length) {
                currentHeights[index] = value;
                if (bars[index]) {
                  bars[index].style.height = `${value}px`;
                  bars[index].classList.add('bar-overwrite');
                }
              }
            }
            break;
            
          case 'pivot':
            if (typeof index === 'number' && bars[index]) {
              bars[index].classList.add('bar-pivot');
            }
            break;
            
          case 'revert':
            if (indices && indices.length >= 2) {
              const [i, j] = indices;
              if (bars[i]) {
                bars[i].classList.remove('bar-compare', 'bar-swap', 'bar-overwrite', 'bar-pivot');
              }
              if (bars[j]) {
                bars[j].classList.remove('bar-compare', 'bar-swap', 'bar-overwrite', 'bar-pivot');
              }
            }
            break;
        }
        
        await sleep(Math.max(1, speed));
      }
      
      // Final cleanup - remove all animation classes
      for (let i = 0; i < bars.length; i++) {
        bars[i].classList.remove('bar-compare', 'bar-swap', 'bar-overwrite', 'bar-pivot');
      }
      
      // Ensure final state matches sorted array
      for (let i = 0; i < Math.min(bars.length, sortedArray.length); i++) {
        bars[i].style.height = `${sortedArray[i]}px`;
      }
      
      // Success animation
      for (let i = 0; i < bars.length; i++) {
        bars[i].classList.add('bar-finished');
        await sleep(5);
      }
      
      // Update state to reflect sorted array
      setArray([...sortedArray]);
      setIsSorted(true);
      
    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      setIsSorting(false);
    }
  };

  // Handle sorting
  const handleSort = async () => {
    if (isSorting || isSorted) return;
    
    // Always sort the original array
    const arrayToSort = [...originalArrayRef.current];
    
    let result;
    switch (algo) {
      case 'bubble':
        result = getBubbleSortAnimations(arrayToSort);
        break;
      case 'quick':
        result = getQuickSortAnimations(arrayToSort);
        break;
      case 'selection':
        result = getSelectionSortAnimations(arrayToSort);
        break;
      case 'merge':
      default:
        result = getMergeSortAnimationsNew(arrayToSort);
        break;
    }

    if (!result || !result.animations || !result.sorted) {
      console.error("Invalid sorting result:", result);
      alert("Sorting algorithm returned invalid result!");
      return;
    }

    const { animations, sorted } = result;
    
    // Validate that the sorted result contains the same elements
    const originalSorted = [...originalArrayRef.current].sort((a, b) => a - b);
    const algorithmSorted = [...sorted].sort((a, b) => a - b);
    
    const isValid = originalSorted.length === algorithmSorted.length &&
                   originalSorted.every((val, idx) => val === algorithmSorted[idx]);
    
    if (!isValid) {
      console.error('Algorithm validation failed!');
      console.log('Original:', originalArrayRef.current);
      console.log('Expected:', originalSorted);
      console.log('Got:', sorted);
      alert('Sorting algorithm produced incorrect result!');
      return;
    }
    
    await runAnimations(animations, sorted);
  };

  // Reset to original unsorted array
  const handleReset = () => {
    if (isSorting) return;
    
    const originalArray = [...originalArrayRef.current];
    setArray(originalArray);
    setIsSorted(false);
    resetBarsToArray(originalArray);
  };

  // Generate new array
  const handleNewArray = () => {
    generateArray();
  };

  return (
    <div className="viz-root">
      <header className="viz-header">
        <h1 className="title">⚡ Sorting Visualizer — Neon Edition</h1>
        <p className="subtitle">Bubble • Quick • Merge • Selection — bright, dynamic & share-ready</p>
      </header>

      <div className="controls">
        <button 
          disabled={isSorting} 
          className="btn primary" 
          onClick={handleNewArray}
        >
          New Array
        </button>
        <button 
          disabled={isSorting || !isSorted} 
          className="btn secondary" 
          onClick={handleReset}
        >
          Reset Array
        </button>
        
        <div className="segmented">
          <button 
            className={algo === 'merge' ? 'seg active' : 'seg'} 
            onClick={() => setAlgo('merge')} 
            disabled={isSorting}
          >
            Merge
          </button>
          <button 
            className={algo === 'quick' ? 'seg active' : 'seg'} 
            onClick={() => setAlgo('quick')} 
            disabled={isSorting}
          >
            Quick
          </button>
          <button 
            className={algo === 'bubble' ? 'seg active' : 'seg'} 
            onClick={() => setAlgo('bubble')} 
            disabled={isSorting}
          >
            Bubble
          </button>
          <button 
            className={algo === 'selection' ? 'seg active' : 'seg'} 
            onClick={() => setAlgo('selection')} 
            disabled={isSorting}
          >
            Selection
          </button>
        </div>
        
        <button 
          disabled={isSorting || isSorted} 
          className="btn success" 
          onClick={handleSort}
        >
          {isSorted ? 'Sorted!' : 'Visualize'}
        </button>

        <div className="slider">
          <label>Size: {size}</label>
          <input 
            type="range" 
            min="20" 
            max="250" 
            value={size} 
            onChange={(e) => setSize(parseInt(e.target.value, 10))} 
            disabled={isSorting}
          />
        </div>
        <div className="slider">
          <label>Speed: {speed}ms</label>
          <input 
            type="range" 
            min="1" 
            max="40" 
            value={speed} 
            onChange={(e) => setSpeed(parseInt(e.target.value, 10))} 
            disabled={isSorting}
          />
        </div>
      </div>

      <div className="bars-container" ref={containerRef}>
        {array.map((value, index) => (
          <div
            key={`${index}-${value}-${originalArrayRef.current.length}`}
            className="bar"
            style={{ 
              height: `${value}px`, 
              width: `${Math.max(2, Math.floor(900 / size))}px` 
            }}
          />
        ))}
      </div>

      <footer className="footer">
        <span>Built By Abhishek Kusalkar ✨ •</span>
      </footer>
    </div>
  );
}