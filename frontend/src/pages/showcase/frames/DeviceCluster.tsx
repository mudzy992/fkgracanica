import { BrowserFrame } from './BrowserFrame';
import { PhoneFrame } from './PhoneFrame';
import { MockPhoneHome } from '../mocks/MockPhoneHome';
import { MockPortal } from '../mocks/MockPortal';

export function DeviceCluster() {
  return (
    <div className="showcase-float relative mx-auto h-[380px] w-full max-w-[520px] lg:h-[420px]">
      <BrowserFrame className="absolute left-0 top-6 w-[86%] -rotate-2">
        <MockPortal />
      </BrowserFrame>
      <PhoneFrame className="absolute bottom-0 right-2 w-[132px] rotate-6 sm:w-[148px]">
        <MockPhoneHome />
      </PhoneFrame>
    </div>
  );
}
