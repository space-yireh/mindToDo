import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "이용약관 | MindToDo",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="이용약관" dateLabel="시행일: 2026년 09월 25일">
      <LegalSection heading="제1조 (목적)">
        <p>
          이 약관은 공간이레(&quot;운영자&quot;)가 제공하는 마인드맵 기반 할 일 관리 서비스
          &quot;MindToDo&quot;(이하 &quot;서비스&quot;)의 이용과 관련하여 운영자와 이용자의 권리, 의무 및
          책임사항을 정함을 목적으로 합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제2조 (서비스의 내용)">
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          <li>
            서비스는 이용자가 마인드맵 형태로 할 일을 설계하고, 이를 이용자 본인의 Google Tasks 계정과
            동기화(가져오기/내보내기)할 수 있도록 지원합니다.
          </li>
          <li>
            서비스는 Google 계정 인증(OAuth 2.0)을 통해 이용자 본인의 Google Tasks 데이터에 접근하며,
            이용자가 명시적으로 &quot;가져오기&quot; 또는 &quot;내보내기&quot; 버튼을 눌렀을 때만 데이터를
            주고받습니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection heading="제3조 (계정 및 인증)">
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          <li>서비스 이용을 위해서는 Google 계정으로 로그인해야 하며, 이때 Google Tasks 접근 권한에 동의해야 합니다.</li>
          <li>
            운영자는 이용자의 Google 계정 자체(비밀번호 등)에 접근하지 않으며, Google이 발급한 접근
            토큰을 통해서만 이용자가 명시적으로 허용한 범위 내에서 Google Tasks 데이터를 다룹니다.
          </li>
          <li>이용자는 언제든지 Google 계정 설정에서 서비스의 접근 권한을 철회할 수 있습니다.</li>
        </ol>
      </LegalSection>

      <LegalSection heading="제4조 (이용자의 의무)">
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          <li>타인의 Google 계정을 무단으로 이용하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 행위 (과도한 자동화 요청, 서비스 취약점 공격 등)</li>
          <li>관계 법령을 위반하는 목적으로 서비스를 이용하는 행위</li>
        </ol>
      </LegalSection>

      <LegalSection heading="제5조 (서비스의 변경 및 중단)">
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          <li>
            운영자는 서비스의 내용을 변경하거나 일부 또는 전부를 중단할 수 있으며, 이 경우 서비스 내 공지
            또는 이메일 등의 방법으로 사전에 고지합니다. 다만 긴급한 사정이 있는 경우 사후에 고지할 수
            있습니다.
          </li>
          <li>
            서비스는 무료로 제공되며, 무료로 제공되는 서비스 이용과 관련하여 관계 법령에 특별한 규정이
            없는 한 운영자는 이에 대해 별도의 책임을 지지 않습니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection heading="제6조 (면책조항)">
        <ol className="flex list-decimal flex-col gap-1 pl-5">
          <li>
            운영자는 천재지변, Google 등 외부 서비스의 장애, 그 밖의 불가항력으로 인하여 서비스를 제공할
            수 없는 경우 책임이 면제됩니다.
          </li>
          <li>
            운영자는 이용자가 서비스를 통해 Google Tasks에 반영한 데이터의 정확성이나 무결성에 대해
            보증하지 않으며, 데이터 반영 전 이용자 스스로 내용을 확인할 책임이 있습니다.
          </li>
          <li>
            서비스는 이용자의 마인드맵 데이터를 별도로 저장하지 않으므로(제7조 참조), 저장하지 않은
            데이터의 손실에 대해 운영자는 책임을 지지 않습니다.
          </li>
        </ol>
      </LegalSection>

      <LegalSection heading="제7조 (데이터 보관에 관한 특칙)">
        <p>
          서비스는 이용자의 마인드맵 편집 내용을 서버나 브라우저 저장소에 보관하지 않습니다. 이용자가
          &quot;내보내기&quot; 버튼을 누른 시점의 데이터만 이용자 본인의 Google Tasks 계정에 반영되며,
          그 외의 편집 중인 내용은 브라우저를 새로고침하거나 닫으면 사라집니다.
        </p>
      </LegalSection>

      <LegalSection heading="제8조 (약관의 변경)">
        <p>
          운영자는 필요한 경우 이 약관을 변경할 수 있으며, 변경 시 서비스 내 공지를 통해 효력 발생일 및
          변경 사유를 명시하여 공지합니다.
        </p>
      </LegalSection>

      <LegalSection heading="제9조 (준거법 및 관할)">
        <p>
          이 약관과 관련하여 분쟁이 발생한 경우 대한민국 법을 준거법으로 하며, 관할 법원은 민사소송법상의
          관할 법원으로 합니다.
        </p>
      </LegalSection>

      <p className="pt-4 text-slate-500 dark:text-slate-400">시행일: 2026년 09월 25일</p>
    </LegalPageLayout>
  );
}
