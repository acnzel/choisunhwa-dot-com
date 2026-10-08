// schema.org 구조화 데이터 출력. `<` 를 이스케이프해 본문 문자열이 </script> 를 닫지 못하게 한다.
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
