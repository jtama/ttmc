import io.quarkiverse.roq.frontmatter.runtime.model.DocumentPage;
import io.quarkiverse.roq.frontmatter.runtime.model.Page;
import io.quarkiverse.roq.frontmatter.runtime.model.RoqCollection;
import io.quarkus.qute.TemplateExtension;

import java.text.Collator;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class TemplateExtensions {

    @TemplateExtension
    public static DocumentPage getFirstModule(RoqCollection collection) {
        return alphabetical(collection).getFirst();
    }

    @TemplateExtension
    public static List<DocumentPage> alphabetical(RoqCollection collection) {
       return alphabeticalAsStream(collection).toList();
    }

    private static Stream<DocumentPage> alphabeticalAsStream(RoqCollection collection) {
        Collator collator = Collator.getInstance(Locale.FRENCH);
        collator.setStrength(Collator.PRIMARY);
        return collection.stream()
                .sorted(Comparator.comparing(DocumentPage::title, collator)
                        .thenComparing(DocumentPage::id));
    }

    @TemplateExtension
    public static String collectionTitles(RoqCollection collection) {
        return "['%s']".formatted(alphabeticalAsStream(collection)
                .map(DocumentPage::title)
                        .map(value -> value.replaceAll("'", "\\\\'"))
                .collect(Collectors.joining("','")));
    }

    @TemplateExtension
    public static String allModules(RoqCollection collection) {
        return alphabeticalAsStream(collection)
                .map(document -> document.url().relative())
                .collect(Collectors.joining(","));
    }

    @TemplateExtension
    public static String nextModule(Page page) {
        Stream<DocumentPage> modules = alphabeticalAsStream(page.site().collections().get("modules"));
        if (page.url().equals(page.site().url()))
           return modules
                   .findFirst()
                   .map(doc -> doc.url().relative())
                   .orElse(page.site().url().fromRoot("leaderboard").absolute());
        return modules
                .filter(item -> item.id().equals(page.id()))
                .findFirst()
                .map(DocumentPage::next)
                .map(doc -> doc.url().relative())
                .orElse(page.site().url().fromRoot("leaderboard").absolute());
    }
}
