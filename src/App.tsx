import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import lottie, { AnimationItem } from "lottie-web";

const DEFAULT_RENDERER_SETTINGS = {
  clearCanvas: false,
  hideOnTransparent: true,
  progressiveLoad: true,
};

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationData, setAnimationData] = useState<any>();
  const [instance, setInstance] = useState<AnimationItem>();
  const [value, setValue] = useState(0);

  const createLottie = useCallback(
    (animation: any) => {
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
      newInstance.playSegments(
        [markers[0 * 2].tm, markers[0 * 2 + 1].tm],
        true
      );
    },
    [instance]
  );

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
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!instance) {
        return;
      }

      const newValue = parseInt(e.target.value, 10);

      const markers = animationData.markers || [];
      instance.playSegments(
        [markers[newValue * 2].tm, markers[newValue * 2 + 1].tm],
        true
      );

      setValue(parseInt(e.target.value, 10));
    },
    [instance, animationData?.markers]
  );

  return (
    <div className="w-full container mx-auto pt-10 space-y-4 max-w-3xl">
      <div className="w-full p-4 border rounded-md shadow-md bg-gray-50">
        <input type="file" onChange={onFileChange} />
      </div>
      <div className="w-full p-4 border rounded-md shadow-md bg-gray-50">
        <div id={"lottie"} ref={containerRef} className="w-full h-full" />
      </div>
      <div className="w-full grid grid-cols-4 gap-4">
        <div className="px-4 py-2 border rounded-md shadow-md bg-gray-50">
          Markers: {(animationData?.markers || []).length / 2}
        </div>
        <div className="px-4 py-2 border rounded-md shadow-md bg-gray-50">
          FPS: {animationData?.fr}
        </div>
        <div className="px-4 py-2 border rounded-md shadow-md bg-gray-50">
          Frames: {animationData?.op}
        </div>
        <div className="px-4 py-2 border rounded-md shadow-md bg-gray-50">
          W/H: {animationData?.w}/{animationData?.h}
        </div>
      </div>
      <div className="w-full grid grid-cols-4 gap-4">
        <div className="px-4 py-2 border rounded-md shadow-md bg-gray-50">
          Current Marker: {value}
        </div>
        <div className="px-4 py-2 border rounded-md shadow-md bg-gray-50">
          M. Frames:{" "}
          {animationData?.markers[value * 2 + 1].tm -
            animationData?.markers[value * 2].tm}
        </div>
        <div className="px-4 py-2 border rounded-md shadow-md bg-gray-50">
          M. F. Start: {animationData?.markers[value * 2].tm}
        </div>
        <div className="px-4 py-2 border rounded-md shadow-md bg-gray-50">
          M. F. End: {animationData?.markers[value * 2 + 1].tm}
        </div>
      </div>
      <div className="w-full p-4 border rounded-md shadow-md bg-gray-50 flex flex-col space-y-4">
        <input
          type="range"
          min="0"
          max={(animationData?.markers?.length / 2 || 1) - 1}
          onChange={onRangeChange}
          className="w-full"
        />
      </div>
    </div>
  );
}

export default App;
