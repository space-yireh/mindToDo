import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "개인정보처리방침 | MindToDo",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="개인정보처리방침" dateLabel="공고일자: 2026년 09월 25일 · 시행일자: 2026년 09월 25일">
      <p>
        MindToDo(&quot;서비스&quot;)는 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련
        법령을 준수합니다. 본 방침은 서비스가 어떤 정보를 어떻게 처리하는지 설명합니다.
      </p>

      <LegalSection heading="1. 수집하는 개인정보 항목 및 수집 방법">
        <p>
          서비스는 <strong>별도의 회원가입 절차 없이 Google 계정 로그인만으로</strong> 이용됩니다.
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong>서버에 저장하는 개인정보: 없음.</strong> 서비스는 백엔드 서버나 데이터베이스를 운영하지
            않으며, 이용자의 이름, 이메일, 마인드맵 내용, 할 일 데이터 등을 어떠한 서버에도 저장하지
            않습니다.
          </li>
          <li>
            <strong>일시적으로 처리하는 정보</strong>: 로그인 시 Google이 발급하는 접근 토큰(access
            token)이 이용자의 브라우저 메모리에만 일시적으로 유지되며, 브라우저를 닫거나 1시간이
            지나면(토큰 만료) 소멸합니다. 이 토큰은 서버로 전송되거나 저장되지 않습니다.
          </li>
          <li>
            <strong>Google Tasks 데이터</strong>: 이용자가 &quot;가져오기&quot;를 누르면 이용자 본인의
            Google Tasks 데이터를 조회하여 브라우저 화면에만 표시하고, &quot;내보내기&quot;를 누르면
            이용자가 편집한 내용을 이용자 본인의 Google Tasks 계정에 반영합니다. 이 과정은 이용자의
            브라우저와 Google 서버 간에 직접 이루어지며, 운영자의 서버를 거치지 않습니다.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. 개인정보의 처리 목적">
        <p>
          서비스는 이용자가 요청한 마인드맵-Google Tasks 동기화 기능을 제공하기 위한 목적으로만 Google
          계정 접근 권한을 사용하며, 그 외의 목적(광고, 마케팅, 제3자 제공 등)으로 이용자의 데이터를
          처리하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection heading="3. Google 사용자 데이터 정책 준수">
        <p>
          본 서비스의 Google 사용자 데이터 사용 및 전송은{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Google API 서비스 사용자 데이터 정책
          </a>
          (Limited Use 요건 포함)을 준수합니다. 서비스는 Google Tasks API를 통해 얻은 데이터를 이용자에게
          제공되는 서비스 기능(마인드맵 표시 및 동기화) 이외의 목적으로 사용하지 않으며, 제3자에게
          판매하거나 제공하지 않고, 광고 목적으로 사용하지 않으며, 사람이 직접 열람하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection heading="4. 개인정보의 보유 및 이용 기간">
        <p>
          서비스는 개인정보를 서버에 저장하지 않으므로, 별도의 보유 기간이 존재하지 않습니다. 접근
          토큰은 브라우저 세션 종료 또는 만료(최대 1시간) 시 자동으로 소멸합니다.
        </p>
      </LegalSection>

      <LegalSection heading="5. 개인정보의 제3자 제공">
        <p>서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
      </LegalSection>

      <LegalSection heading="6. 쿠키 및 로컬 저장소 사용">
        <p>
          서비스는 이용자 식별이나 추적을 위한 쿠키를 사용하지 않습니다. 다만 테마(라이트/다크)와 언어
          설정(한국어/영어) 같은 단순 UI 환경설정은 이용자의 브라우저 로컬 저장소(localStorage)에
          저장되며, 이는 서버로 전송되지 않고 개인을 식별하는 데 사용되지 않습니다.
        </p>
      </LegalSection>

      <LegalSection heading="7. 이용자의 권리">
        <p>
          이용자는 언제든지{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Google 계정 보안 설정
          </a>
          에서 서비스의 Google Tasks 접근 권한을 철회할 수 있습니다. 권한을 철회하면 서비스는 더 이상
          이용자의 Google Tasks에 접근할 수 없습니다.
        </p>
      </LegalSection>

      <LegalSection heading="8. 만 14세 미만 아동의 개인정보">
        <p>서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를 의도적으로 수집하지 않습니다.</p>
      </LegalSection>

      <LegalSection heading="9. 개인정보 보호책임자 및 문의처">
        <p>서비스 이용 및 개인정보 처리와 관련한 문의사항은 아래로 연락해 주시기 바랍니다.</p>
        <ul className="flex flex-col gap-1 pl-5">
          <li>
            <strong>운영자</strong>: 공간이레
          </li>
          <li>
            <strong>이메일</strong>: space.yireh@gmail.com
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="10. 고지의 의무">
        <p>
          이 개인정보처리방침은 법령·정책 또는 서비스 내용의 변경에 따라 개정될 수 있으며, 개정 시 서비스
          내 공지사항을 통해 고지합니다.
        </p>
      </LegalSection>

      <p className="pt-4 text-slate-500 dark:text-slate-400">
        공고일자: 2026년 09월 25일
        <br />
        시행일자: 2026년 09월 25일
      </p>
    </LegalPageLayout>
  );
}
