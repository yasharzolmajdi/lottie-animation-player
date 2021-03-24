import React, { useCallback, useEffect, useRef, useState } from "react";
import lottie, { AnimationItem } from "lottie-web";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import animationSlider from "./animation-slider.json";

const DEFAULT_RENDERER_SETTINGS = {
  clearCanvas: false,
  hideOnTransparent: true,
  progressiveLoad: true,
};

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationData, setAnimationData] = useState<any>();
  const [instance, setInstance] = useState<AnimationItem>();
  const [value, setValue] = useState(1);
  const [rangeValue, setRangeValue] = useState(0);

  const createLottie = useCallback(
    (animation: any) => {
      const slider = document.getElementById("slider");
      if (instance) {
        instance.destroy();
      }

      const newInstance = lottie.loadAnimation({
        rendererSettings: DEFAULT_RENDERER_SETTINGS,
        animationData: animation,
        autoplay: true,
        container: containerRef.current as Element,
        loop: true,
      });

      setAnimationData(animation);
      setInstance(newInstance);

      const markers = animation.markers || [];
      if (markers.length === 0) {
        slider?.setAttribute("max", animation.op);
        return;
      }

      if (markers.legnth < 3) {
        throw new Error("animation needs to have 4 makers or no markers");
      }

      const firstMaker = markers[0];
      const secondMaker = markers[1];

      slider?.setAttribute("min", firstMaker.tm);
      slider?.setAttribute("max", secondMaker.tm);

      newInstance.playSegments([markers[2].tm, markers[3].tm], true);
    },
    [instance]
  );

  useEffect(() => {
    createLottie(animationSlider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = useCallback(
    (event) => {
      const input = event.target;
      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          createLottie(JSON.parse(e.target?.result as string));
        };

        reader.readAsText(input.files[0]);
      }
    },
    [createLottie]
  );

  const onRangeChange = React.useCallback(
    (value: number) => {
      if (!instance) {
        return;
      }
      const markers = animationData.markers || [];
      if (markers.legnth === 0) {
        return;
      }

      instance.resetSegments(true);
      instance.goToAndStop(value, true);

      setRangeValue(value);
    },
    [instance, animationData?.markers]
  );

  const handleAfterChange = React.useCallback(
    (value: number) => {
      if (!instance) {
        return;
      }
      const markers = animationData.markers || [];
      if (markers.legnth === 0) {
        return;
      }

      const secondMaker = markers[1];
      const newValue =
        Math.round((value / secondMaker.tm) * (markers.length / 2 - 2)) + 1;
      instance.playSegments(
        [markers[newValue * 2].tm, markers[newValue * 2 + 1].tm],
        true
      );

      setValue(newValue);
      const length = animationData.markers.length / 2 - 2;
      const newRangeValue =
        ((newValue - 1) / length) * animationData.markers[1].tm;
      setRangeValue(newRangeValue);
    },
    [instance, animationData?.markers]
  );

  let sliderMaker: Record<number, string> = {};

  for (let i = 0; i < animationData?.markers.length / 2 - 1; i += 1) {
    const length = animationData.markers.length / 2 - 2;

    sliderMaker = {
      ...sliderMaker,
      [Math.round((i / length) * animationData.markers[1].tm)]: "",
    };
  }

  return (
    <div className="w-full container mx-auto pt-10 space-y-4 max-w-3xl">
      <div className="w-full p-4 border rounded-md shadow-md bg-gray-50">
        <input type="file" onChange={onFileChange} />
      </div>
      <div className="w-full grid grid-cols-12 gap-4">
        <div className="w-full p-4 border rounded-md shadow-md bg-gray-50 col-span-9">
          <div
            id={"lottie"}
            ref={containerRef}
            className="w-full h-full max-w-lg mx-auto"
          />
        </div>
        <div className="w-full flex flex-col space-y-2 col-span-3 border rounded-md shadow-md bg-gray-50 p-4">
          <div>Markers: {(animationData?.markers || []).length / 2 - 1}</div>
          <div>FPS: {animationData?.fr}</div>
          <div>Frames: {animationData?.op}</div>
          <div>
            W/H: {animationData?.w}/{animationData?.h}
          </div>
          <div>Current Marker: {value}</div>
          <div>
            M. Frames:{" "}
            {animationData?.markers[value * 2 + 1].tm -
              animationData?.markers[value * 2].tm}
          </div>
          <div>M. F. Start: {animationData?.markers[value * 2].tm}</div>
          <div>M. F. End: {animationData?.markers[value * 2 + 1].tm}</div>
        </div>
      </div>
      <div className="w-full p-4 border rounded-md shadow-md bg-gray-50 flex flex-col space-y-4">
        <Slider
          marks={sliderMaker}
          max={animationData?.markers ? animationData.markers[1].tm : 0}
          onChange={onRangeChange}
          onAfterChange={handleAfterChange}
          value={rangeValue}
          className="w-full"
        />
      </div>
    </div>
  );
}

export default App;
