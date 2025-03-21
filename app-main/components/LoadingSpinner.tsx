// components/LoadingSpinner.tsx
import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <svg
        className={styles.sp}
        viewBox="0 0 128 128"
        width="128px"
        height="128px"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" />
            <stop offset="40%" stopColor="#fff" />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
          <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" />
            <stop offset="60%" stopColor="#000" />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
          <mask id="mask1">
            <rect x="0" y="0" width="128" height="128" fill="url(#grad1)" />
          </mask>
          <mask id="mask2">
            <rect x="0" y="0" width="128" height="128" fill="url(#grad2)" />
          </mask>
        </defs>

        <g fill="none" strokeLinecap="round" strokeWidth="16">
          <circle className={styles.sp__ring} r="56" cx="64" cy="64" stroke="#ddd" />

          <g stroke="hsl(223,90%,50%)">
            <path
              className={styles.sp__worm1}
              d="M120,64c0,30.928-25.072,56-56,56S8,94.928,8,64"
              stroke="hsl(343,90%,50%)"
              strokeDasharray="43.98 307.87"
            />
            <g transform="translate(42,42)">
              <g className={styles.sp__worm2} transform="translate(-42,0)">
                <path
                  className={styles.sp__worm2_1}
                  d="M8,22c0-7.732,6.268-14,14-14s14,6.268,14,14"
                  strokeDasharray="43.98 175.92"
                />
              </g>
            </g>
          </g>

          <g stroke="hsl(283,90%,50%)" mask="url(#mask1)">
            <path
              className={styles.sp__worm1}
              d="M120,64c0,30.928-25.072,56-56,56S8,94.928,8,64"
              strokeDasharray="43.98 307.87"
            />
            <g transform="translate(42,42)">
              <g className={styles.sp__worm2} transform="translate(-42,0)">
                <path
                  className={styles.sp__worm2_1}
                  d="M8,22c0-7.732,6.268-14,14-14s14,6.268,14,14"
                  strokeDasharray="43.98 175.92"
                />
              </g>
            </g>
          </g>

          <g stroke="hsl(343,90%,50%)" mask="url(#mask2)">
            <path
              className={styles.sp__worm1}
              d="M120,64c0,30.928-25.072,56-56,56S8,94.928,8,64"
              strokeDasharray="43.98 307.87"
            />
            <g transform="translate(42,42)">
              <g className={styles.sp__worm2} transform="translate(-42,0)">
                <path
                  className={styles.sp__worm2_1}
                  d="M8,22c0-7.732,6.268-14,14-14s14,6.268,14,14"
                  strokeDasharray="43.98 175.92"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
